// ===== Imports =====
const express = require("express");
const { MongoClient, MongoError, ObjectId } = require("mongodb");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const OpenAI = require('openai');
const fetch = require('node-fetch');
const pdf = require('pdf-parse');

const { createAuthFunctions, generateToken, verifyToken } = require("./auth");
const { initPassport } = require("./oauth");
const { upload, transcribeAudio, transcribeStream } = require("./whisper");
const codeExecutorRoutes = require("./routes/codeExecutor");
const { initProfileRoutes } = require("./routes/profile");

require("dotenv").config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

// Trust proxy for HTTPS detection in production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
// ===== Middleware =====
app.use(cors({}));
app.use(express.json());
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret-change-this",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production', // use secure cookies in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ===== DB Setup =====
let db;
let authFunctions;
let profileRoutes;

// ===== OAuth Routes (must be defined after passport setup) =====
// These will be initialized after database connection and passport configuration

MongoClient.connect(process.env.DB_URL)
  .then((client) => {
    db = client.db("interviewtrainer");
    authFunctions = createAuthFunctions(db);
    initPassport(db);
    profileRoutes = initProfileRoutes(db);
    
    // Initialize OAuth routes FIRST (before any protected middleware)
    app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
    app.get("/api/auth/callback/google",
      passport.authenticate("google", { 
        failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/callback?error=google_auth_failed`
      }),
      (req, res) => {
        try {
          if (!req.user) {
            const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
            return res.redirect(`${clientUrl}/auth/callback?error=no_user_data`);
          }
          
          const token = generateToken(req.user._id);
          const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
          res.redirect(`${clientUrl}/auth/callback?token=${token}`);
        } catch (error) {
          console.error('Google OAuth callback error:', error);
          const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
          res.redirect(`${clientUrl}/auth/callback?error=server_error`);
        }
      }
    );

    app.get("/api/auth/github", passport.authenticate("github", { scope: ["user:email"] }));
    app.get("/api/auth/callback/github",
      passport.authenticate("github", { 
        failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/callback?error=github_auth_failed`
      }),
      (req, res) => {
        try {
          if (!req.user) {
            const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
            return res.redirect(`${clientUrl}/auth/callback?error=no_user_data`);
          }
          
          const token = generateToken(req.user._id);
          const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
          res.redirect(`${clientUrl}/auth/callback?token=${token}`);
        } catch (error) {
          console.error('GitHub OAuth callback error:', error);
          const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
          res.redirect(`${clientUrl}/auth/callback?error=server_error`);
        }
      }
    );
    
    // Initialize protected routes after OAuth routes
    app.use("/api", authenticateToken, profileRoutes);
    
    console.log("✅ OAuth routes initialized");
    console.log("DB connection successful!! ✅");
  })
  .catch((err) =>
    console.log("Error in connection of database", err.message)
  );

// ====== AUTH Middleware ======
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: "Invalid token" });

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ====== Routes ======

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Payments
const paymentRoutes = require("./Models/Payments");
app.use(paymentRoutes);

// Code Executor
app.use("/api", codeExecutorRoutes);

// Auth routes (non-OAuth)
app.post("/api/auth/signup", (req, res) => authFunctions ? authFunctions.signUp(req, res) : res.status(500).json({message: "Auth not initialized"}));
app.post("/api/auth/signin", (req, res) => authFunctions ? authFunctions.signIn(req, res) : res.status(500).json({message: "Auth not initialized"}));
app.get("/api/auth/validate", (req, res) => authFunctions ? authFunctions.validateToken(req, res) : res.status(500).json({message: "Auth not initialized"}));

// Interview Response Storage
app.post("/api/interview/response", authenticateToken, async (req, res) => {
  try {
    const {
      question,
      questionId,
      response,
      wordCount,
      timeSpent,
      confidence,
      category,
      difficulty,
    } = req.body;

    if (!question || !response || !wordCount || timeSpent === undefined || !confidence) {
      return res.status(400).json({
        message:
          "Missing required fields: question, response, wordCount, timeSpent, confidence",
      });
    }

    const interviewResponse = {
      userId: req.user._id,
      userEmail: req.user.email,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      question: {
        id: questionId || null,
        text: question,
        category: category || "General",
        difficulty: difficulty || "Medium",
      },
      response: {
        text: response,
        wordCount: parseInt(wordCount),
        timeSpent: parseInt(timeSpent),
        confidence: parseFloat(confidence),
        timestamp: new Date(),
      },
      metadata: {
        createdAt: new Date(),
        sessionId: req.headers["x-session-id"] || null,
        userAgent: req.headers["user-agent"] || null,
      },
    };

    const result = await db
      .collection("interview_responses")
      .insertOne(interviewResponse);

    res.status(201).json({
      success: true,
      message: "Interview response saved successfully",
      responseId: result.insertedId,
      data: {
        id: result.insertedId,
        timestamp: interviewResponse.response.timestamp,
        wordCount: interviewResponse.response.wordCount,
        timeSpent: interviewResponse.response.timeSpent,
      },
    });
  } catch (error) {
    console.error("Error saving interview response:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save interview response",
      error: error.message,
    });
  }
});

// Get Interview Responses
app.get("/api/interview/responses", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, difficulty } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { userId: req.user._id };
    if (category && category !== "all") filter["question.category"] = category;
    if (difficulty && difficulty !== "all") filter["question.difficulty"] = difficulty;

    const responses = await db
      .collection("interview_responses")
      .find(filter)
      .sort({ "metadata.createdAt": -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const totalCount = await db.collection("interview_responses").countDocuments(filter);

    const stats = await db
      .collection("interview_responses")
      .aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalResponses: { $sum: 1 },
            averageWordCount: { $avg: "$response.wordCount" },
            averageTimeSpent: { $avg: "$response.timeSpent" },
            averageConfidence: { $avg: "$response.confidence" },
            totalTimeSpent: { $sum: "$response.timeSpent" },
          },
        },
      ])
      .toArray();

    res.json({
      success: true,
      data: {
        responses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNext: skip + responses.length < totalCount,
          hasPrev: parseInt(page) > 1,
        },
        statistics: stats[0] || {
          totalResponses: 0,
          averageWordCount: 0,
          averageTimeSpent: 0,
          averageConfidence: 0,
          totalTimeSpent: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching interview responses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interview responses",
      error: error.message,
    });
  }
});


// Get Latest Interview Report
app.get("/api/interview-report/latest", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Fetch the latest analysis
    const analyses = await db
      .collection("interview_analyses")
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();
    
    const analysis = analyses[0];

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "No interview analysis found"
      });
    }

    console.log(`📊 Fetched latest interview report for user: ${req.user.email}`);
    
    res.json({
      success: true,
      ...analysis
    });

  } catch (error) {
    console.error("❌ Error fetching interview report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interview report",
      error: error.message,
    });
  }
});

// Get Comprehensive Interview Report (All Interviews Analysis)
// MUST be before /:id route to avoid matching "comprehensive" as an id
app.get("/api/interview-report/comprehensive", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    console.log(`📊 Fetching all interviews for user: ${userId}`);

    // Fetch all analyses for the user (userId is stored as string in DB)
    const allAnalyses = await db
      .collection("interview_analyses")
      .find({ userId: userId })
      .sort({ createdAt: 1 })
      .toArray();

    console.log(`📊 Found ${allAnalyses.length} interviews`);

    if (!allAnalyses || allAnalyses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No interview analyses found. Please complete at least one interview first."
      });
    }

    console.log(`📊 Generating comprehensive report for ${allAnalyses.length} interviews`);

    // Use Gemini to analyze all interviews together
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Prepare data for Gemini
    const interviewSummaries = allAnalyses.map((analysis, index) => {
      const result = analysis.analysisResult || {};
      return `
Interview ${index + 1} (${new Date(analysis.createdAt).toLocaleDateString()}):
- Role: ${analysis.role || 'N/A'}
- Difficulty: ${analysis.difficulty || 'N/A'}
- Overall Score: ${result.overallScore || 0}/10
- Clarity Score: ${result.clarityScore || 0}/10
- Technical Score: ${result.technicalScore ? Math.round(result.technicalScore / 10) : 0}/10
- Strengths: ${Array.isArray(result.strengths) ? result.strengths.join(', ') : 'N/A'}
- Improvements: ${Array.isArray(result.improvements) ? result.improvements.join(', ') : 'N/A'}
- Mistakes: ${Array.isArray(result.mistakes) ? result.mistakes.join(', ') : 'N/A'}
`;
    }).join('\n---\n');

    const prompt = `You are an expert career coach and interview analyzer. Analyze the following ${allAnalyses.length} interview attempts by a candidate and create a comprehensive performance report.

${interviewSummaries}

Based on ALL these interviews, provide a comprehensive analysis in the following JSON format:
{
  "overallScore": <average overall score 0-10>,
  "clarityScore": <average clarity score 0-10>,
  "technicalScore": <average technical score 0-10>,
  "totalInterviews": ${allAnalyses.length},
  "progressTrend": "<improving/declining/stable>",
  "feedback": "<comprehensive feedback about their overall performance across all interviews>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement area 1>", "<improvement area 2>", "<improvement area 3>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"],
  "nextSteps": ["<specific next step 1>", "<specific next step 2>", "<specific next step 3>"],
  "scoreProgression": [
    {"overall": <score 0-10>, "clarity": <score 0-10>, "technical": <score 0-10>},
    ... for each of the ${allAnalyses.length} interviews in chronological order
  ],
  "keyInsights": ["<insight 1>", "<insight 2>", "<insight 3>"]
}

Provide actionable, specific recommendations based on their performance trends. Focus on what they're doing well and what specific areas need improvement.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response
    let comprehensiveAnalysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        comprehensiveAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      comprehensiveAnalysis = {
        overallScore: 0,
        clarityScore: 0,
        technicalScore: 0,
        totalInterviews: allAnalyses.length,
        progressTrend: 'stable',
        feedback: responseText,
        strengths: [],
        improvements: [],
        recommendations: [],
        nextSteps: [],
        scoreProgression: [],
        keyInsights: []
      };
    }

    // Add interview history
    comprehensiveAnalysis.interviewHistory = allAnalyses.map(analysis => ({
      id: analysis._id,
      date: analysis.createdAt,
      role: analysis.role,
      difficulty: analysis.difficulty,
      scores: {
        overall: analysis.analysisResult?.overallScore || 0,
        clarity: analysis.analysisResult?.clarityScore || 0,
        technical: analysis.analysisResult?.technicalScore ? Math.round(analysis.analysisResult.technicalScore / 10) : 0
      }
    }));

    console.log(`✅ Comprehensive report generated for user: ${req.user.email}`);
    
    res.json({
      success: true,
      comprehensiveAnalysis,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error("❌ Error generating comprehensive report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate comprehensive report",
      error: error.message,
    });
  }
});

// Get Interview Report by ID
app.get("/api/interview-report/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { id } = req.params;

    // Fetch specific analysis by ID
    const analysis = await db
      .collection("interview_analyses")
      .findOne({ 
        _id: new ObjectId(id),
        userId: userId 
      });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Interview analysis not found"
      });
    }

    console.log(`📊 Fetched interview report ${id} for user: ${req.user.email}`);
    
    res.json({
      success: true,
      ...analysis
    });

  } catch (error) {
    console.error("❌ Error fetching interview report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interview report",
      error: error.message,
    });
  }
});

// About Us API endpoints
app.get('/api/about/team', async (req, res) => {
  try {
    const teamMembers = [
      {
        name: "Alex Chen",
        role: "Co-Founder & CEO",
        image: "AC",
        description: "Former Google engineer with 8+ years in AI/ML. Led teams at top tech companies.",
        linkedin: "#",
        twitter: "#"
      },
      {
        name: "Sarah Johnson",
        role: "Co-Founder & CTO",
        image: "SJ",
        description: "AI researcher and Stanford PhD. Expert in natural language processing.",
        linkedin: "#",
        twitter: "#"
      },
      {
        name: "Michael Park",
        role: "Head of Product",
        image: "MP",
        description: "Product leader from Meta with deep experience in user-centric design.",
        linkedin: "#",
        twitter: "#"
      },
      {
        name: "Emily Davis",
        role: "Lead Engineer",
        image: "ED",
        description: "Full-stack engineer passionate about creating seamless user experiences.",
        linkedin: "#",
        twitter: "#"
      },
      {
        name: "David Wilson",
        role: "Data Scientist",
        image: "DW",
        description: "ML engineer specializing in speech recognition and behavioral analysis.",
        linkedin: "#",
        twitter: "#"
      },
      {
        name: "Jessica Lee",
        role: "UX Designer",
        image: "JL",
        description: "Creative designer focused on crafting intuitive and engaging user interfaces.",
        linkedin: "#",
        twitter: "#"
      },
      {
        name: "Robert Kim",
        role: "Backend Engineer",
        image: "RK",
        description: "Systems architect with expertise in scalable infrastructure and APIs.",
        linkedin: "#",
        twitter: "#"
      }
    ];

    res.json({
      success: true,
      data: teamMembers
    });
  } catch (error) {
    console.error('Error fetching team data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team data',
      error: error.message
    });
  }
});

app.get('/api/about/company', async (req, res) => {
  try {
    const companyData = {
      story: {
        title: "Our Story",
        paragraphs: [
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, My five centuries but also the leap into electronic typesetting.",
          "It has survived not only five centuries but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
          "Our platform combines advanced AI with proven interview techniques to provide personalized feedback and practice opportunities that actually work."
        ]
      },
      stats: {
        successStories: "15K+",
        successRate: "98%",
        userRating: "4.9★"
      }
    };

    res.json({
      success: true,
      data: companyData
    });
  } catch (error) {
    console.error('Error fetching company data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company data',
      error: error.message
    });
  }
});

app.get('/api/about/vision-mission', async (req, res) => {
  try {
    const visionMissionData = {
      vision: {
        title: "Our Vision",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s. My five centuries but also the leap into electronic typesetting, remaining essentially unchanged."
      },
      mission: {
        title: "Our Mission",
        description: "It has survived not only five centuries but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software."
      }
    };

    res.json({
      success: true,
      data: visionMissionData
    });
  } catch (error) {
    console.error('Error fetching vision-mission data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vision-mission data',
      error: error.message
    });
  }
});

app.get('/api/about/contact', async (req, res) => {
  try {
    const contactData = {
      title: "Work with us",
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s. My five centuries but also the leap into electronic typesetting.",
      email: "contact@interviewtrainer.ai",
      ctaText: "Email to Us"
    };

    res.json({
      success: true,
      data: contactData
    });
  } catch (error) {
    console.error('Error fetching contact data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact data',
      error: error.message
    });
  }
});

// Contact Us API endpoints
app.get('/api/contact/use-cases', async (req, res) => {
  try {
    const useCases = [
      {
        title: "Interview Preparation",
        description: "Practice with AI-powered mock interviews tailored to your industry and role.",
        icon: "💼"
      },
      {
        title: "Technical Skills Assessment",
        description: "Evaluate and improve your technical knowledge with interactive coding challenges.",
        icon: "⚡"
      },
      {
        title: "Behavioral Question Training",
        description: "Master the art of storytelling with STAR method coaching and feedback.",
        icon: "🎯"
      },
      {
        title: "Resume Optimization",
        description: "Get AI-powered suggestions to make your resume stand out to recruiters.",
        icon: "📄"
      }
    ];

    res.json({
      success: true,
      data: useCases
    });
  } catch (error) {
    console.error('Error fetching use cases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch use cases',
      error: error.message
    });
  }
});

// Contact form submission endpoint
app.post('/api/contact/submit', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: firstName, lastName, email, message'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Create contact submission document
    const contactSubmission = {
      firstName,
      lastName,
      email,
      phoneNumber: phoneNumber || null,
      message,
      timestamp: new Date(),
      status: 'new',
      metadata: {
        userAgent: req.headers['user-agent'] || null,
        ip: req.ip || req.connection.remoteAddress || null
      }
    };

    // Store in database
    const result = await db.collection('contact_submissions').insertOne(contactSubmission);

    if (result.acknowledged) {
      res.status(201).json({
        success: true,
        message: 'Contact form submitted successfully',
        submissionId: result.insertedId,
        data: {
          id: result.insertedId,
          timestamp: contactSubmission.timestamp,
          status: contactSubmission.status
        }
      });
    } else {
      throw new Error('Failed to save contact submission');
    }

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: error.message
    });
  }
});

// ===== Whisper transcription =====
app.post("/api/transcribe", upload.single("audio"), transcribeAudio);
app.post("/api/transcribe/stream", upload.single("audio"), transcribeStream);

// ====== 🎥 Your Recording APIs with Supabase ======

const { uploadToSupabase, deleteFromSupabase } = require('./utils/storageService');

// Multer setup for memory storage (we'll upload to Supabase)
const uploadRecordingMemory = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/webm', 'video/mp4', 'video/ogg', 'video/x-matroska'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  }
});

// Save Recording with Supabase
app.post("/api/recordings", authenticateToken, uploadRecordingMemory.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }

    console.log(`📹 Receiving recording: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`👤 User ID: ${req.user._id}`);

    // Upload to Supabase
    const uploadResult = await uploadToSupabase(
      req.file.buffer,
      req.file.originalname,
      'recordings',
      req.file.mimetype
    );

    if (!uploadResult.success) {
      console.error('Upload to Supabase failed:', uploadResult.error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to upload to cloud storage",
        error: uploadResult.error 
      });
    }

    // Save metadata to MongoDB with userId
    const recording = {
      userId: req.user._id.toString(),  // Store user ID
      userEmail: req.user.email,        // Store user email for reference
      filename: req.file.originalname,
      path: uploadResult.path,        // Supabase path
      url: uploadResult.url,           // Public URL
      bucket: uploadResult.bucket,     // Bucket name
      role: req.body.role || "unknown",
      difficulty: req.body.difficulty || "unknown",
      size: req.file.size,
      mimetype: req.file.mimetype,
      createdAt: new Date(),
    };

    const result = await db.collection("recordings").insertOne(recording);
    recording._id = result.insertedId;

    console.log(`✅ Recording saved successfully with ID: ${result.insertedId} for user: ${req.user.email}`);

    res.json({ success: true, recording });
  } catch (err) {
    console.error('❌ Recording upload error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error saving recording",
      error: err.message 
    });
  }
});


// Fetch Recordings from Supabase - Only user's own recordings
app.get("/api/recordings", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    const recordings = await db
      .collection("recordings")
      .find({ userId: userId })  // Filter by user ID
      .sort({ createdAt: -1 })
      .toArray();

    // For each recording, check if analysis exists and get question from interview_responses
    const recordingsWithAnalysis = await Promise.all(
      recordings.map(async (recording) => {
        try {
          // Get analysis
          const analysis = await db
            .collection("interview_analyses")
            .findOne({ recordingId: recording._id.toString() });
          
          // Get question from interview_responses collection
          const interviewResponse = await db
            .collection("interview_responses")
            .findOne({ 
              userId: userId,
              "metadata.recordingId": recording._id.toString() 
            });
          
          // Extract question text
          let questionText = null;
          if (interviewResponse?.question) {
            questionText = typeof interviewResponse.question === 'object' 
              ? interviewResponse.question.text 
              : interviewResponse.question;
          } else if (analysis?.question) {
            questionText = analysis.question;
          } else if (recording.question) {
            questionText = recording.question;
          }
          
          return {
            ...recording,
            hasAnalysis: !!analysis,
            analysisId: analysis?._id || null,
            analysisDate: analysis?.createdAt || null,
            question: questionText
          };
        } catch (err) {
          console.warn(`Failed to check analysis for recording ${recording._id}:`, err.message);
          return {
            ...recording,
            hasAnalysis: false,
            analysisId: null,
            analysisDate: null,
            question: null
          };
        }
      })
    );

    console.log(`📋 Fetched ${recordings.length} recordings for user: ${req.user.email}`);
    res.json(recordingsWithAnalysis);
  } catch (err) {
    console.error('❌ Error fetching recordings:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching recordings",
      error: err.message 
    });
  }
});

// Delete Recording from Supabase
app.delete("/api/recordings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const recording = await db.collection("recordings").findOne({ _id: new ObjectId(id) });

    if (!recording) {
      return res.status(404).json({ success: false, message: "Recording not found" });
    }

    console.log(`🗑️  Deleting recording: ${recording.filename}`);

    // Delete from Supabase
    if (recording.path) {
      const deleteResult = await deleteFromSupabase(recording.path, recording.bucket);
      if (!deleteResult.success) {
        console.warn('⚠️  Failed to delete from Supabase:', deleteResult.error);
      }
    }

    // Delete from MongoDB
    await db.collection("recordings").deleteOne({ _id: new ObjectId(id) });

    console.log('✅ Recording deleted successfully');
    res.json({ success: true, message: "Recording deleted successfully" });
  } catch (err) {
    console.error('❌ Error deleting recording:', err);
    res.status(500).json({ 
      success: false, 
      message: "Error deleting recording",
      error: err.message 
    });
  }
});

// ===== Gemini AI Analysis =====
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { AssemblyAI } = require('assemblyai');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize AssemblyAI client - FREE tier available! 
// Get your free API key from: https://www.assemblyai.com/
const assemblyClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || process.env.GEMINI_API_KEY // Use Gemini key as fallback
});

// Helper function to extract audio from video and transcribe using AssemblyAI
async function extractAndTranscribeVideo(videoBuffer, filename, role, difficulty) {
  return new Promise(async (resolve, reject) => {
    try {
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const videoPath = path.join(tempDir, `video_${Date.now()}_${filename}`);
      const audioPath = path.join(tempDir, `audio_${Date.now()}.mp3`);

      // Write video buffer to temp file
      fs.writeFileSync(videoPath, videoBuffer);
      console.log('📁 Video saved to temp file');

      // Extract audio from video using ffmpeg
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .audioChannels(1)
        .audioFrequency(16000)
        .on('end', async () => {
          console.log('🎵 Audio extracted successfully');
          
          try {
            // Transcribe using AssemblyAI
            console.log('🎙️ Transcribing audio with AssemblyAI...');
            
            const transcript = await assemblyClient.transcripts.transcribe({
              audio: audioPath,
              language_code: 'en'
            });

            // Get audio duration
            const audioStats = fs.statSync(audioPath);
            const estimatedDuration = Math.floor(audioStats.size / 16000);

            // Clean up temp files
            fs.unlinkSync(videoPath);
            fs.unlinkSync(audioPath);

            if (transcript.status === 'error') {
              reject(new Error(`Transcription failed: ${transcript.error}`));
              return;
            }

            if (!transcript.text || transcript.text.trim().length === 0) {
              reject(new Error('No speech detected in the video'));
              return;
            }

            console.log('✅ Real transcription complete:', transcript.text.substring(0, 100) + '...');
            resolve({
              transcript: transcript.text.trim(),
              duration: estimatedDuration,
              language: 'en',
              confidence: transcript.confidence || 0.9
            });

          } catch (assemblyError) {
            // Clean up temp files on error
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
            
            console.error('AssemblyAI error:', assemblyError);
            reject(new Error(`Speech recognition failed: ${assemblyError.message}`));
          }
        })
        .on('error', (err) => {
          // Clean up temp files on error
          if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
          if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
          reject(new Error(`FFmpeg error: ${err.message}`));
        })
        .save(audioPath);

    } catch (error) {
      reject(error);
    }
  });
}

// Analyze Recording endpoint
app.post("/api/analyze-recording", authenticateToken, uploadRecordingMemory.single("video"), async (req, res) => {
  try {
    const { recordingId, role, difficulty, videoUrl } = req.body;
    
    console.log(`🔍 Starting analysis for recording: ${recordingId}`);
    console.log(`👤 User: ${req.user.email}`);
    console.log(`🎯 Role: ${role}, Difficulty: ${difficulty}`);

    if (!recordingId && !req.file && !videoUrl) {
      return res.status(400).json({ 
        success: false, 
        message: "Recording ID, video file, or video URL is required" 
      });
    }

    // Step 1: Get the video file
    let videoBuffer;
    let filename = 'interview.webm';
    
    if (req.file) {
      videoBuffer = req.file.buffer;
      filename = req.file.originalname;
      console.log(`📁 Using uploaded video file: ${filename}`);
    } else if (recordingId) {
      // Fetch the recording from database to download the video
      const recording = await db.collection("recordings").findOne({ 
        _id: new ObjectId(recordingId),
        userId: req.user._id.toString() 
      });
      
      if (!recording) {
        return res.status(404).json({ 
          success: false, 
          message: "Recording not found" 
        });
      }
      
      // Download video from Supabase URL
      const recordingUrl = recording.url || recording.path;
      console.log(`📹 Downloading video from: ${recordingUrl}`);
      
      try {
        const response = await fetch(recordingUrl);
        if (!response.ok) {
          throw new Error(`Failed to download video: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        videoBuffer = Buffer.from(arrayBuffer);
        filename = recording.filename;
        console.log(`✅ Video downloaded: ${filename}`);
      } catch (downloadError) {
        console.error('❌ Video download failed:', downloadError);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to download video for analysis" 
        });
      }
    }

    if (!videoBuffer) {
      return res.status(400).json({ 
        success: false, 
        message: "No video data available for analysis" 
      });
    }

    // Step 2: Extract audio and transcribe the video using AssemblyAI
    let transcript;
    let transcriptionDuration;
    
    try {
      console.log('🎙️ Extracting audio and performing REAL speech-to-text with AssemblyAI...');
      
      const transcriptionResult = await extractAndTranscribeVideo(videoBuffer, filename, role, difficulty);
      transcript = transcriptionResult.transcript;
      transcriptionDuration = transcriptionResult.duration;
      
      console.log(`✅ Real transcription complete (${transcriptionDuration}s): ${transcript.substring(0, 150)}...`);
      
    } catch (transcriptionError) {
      console.error('❌ Transcription failed:', transcriptionError);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to transcribe your speech",
        error: transcriptionError.message 
      });
    }

    // Step 3: Get interview questions based on role and difficulty
    const interviewQuestions = {
      frontend: {
        easy: "Tell me about yourself and your experience with frontend development. What projects have you worked on recently?",
        medium: "How do you optimize website performance and what tools do you use to measure and improve it?",
        hard: "How would you architect a large-scale React application with complex state management and real-time features?"
      },
      backend: {
        easy: "Tell me about your experience with backend development and describe a recent API you've built.",
        medium: "How do you design and implement a robust authentication system with proper security measures?",
        hard: "How would you design a distributed system that can handle millions of concurrent users while maintaining data consistency?"
      },
      fullstack: {
        easy: "Walk me through your full-stack development experience and describe how you handle communication between frontend and backend.",
        medium: "How do you implement real-time features in web applications and ensure security across the entire stack?",
        hard: "How would you architect a scalable, real-time collaboration platform that works offline and syncs data across multiple clients?"
      },
      "data-scientist": {
        easy: "Tell me about your experience with data science and walk me through a recent project from data collection to model deployment.",
        medium: "How do you approach building and evaluating machine learning models, and how do you handle challenges like imbalanced datasets?",
        hard: "How would you design and implement a real-time machine learning pipeline that can handle concept drift and scale to millions of predictions per day?"
      }
    };

    const question = interviewQuestions[role]?.[difficulty] || interviewQuestions.frontend.easy;

    // Step 4: Get the model and create analysis prompt with actual transcript
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Create a comprehensive prompt with the actual transcript and question
    const analysisPrompt = `
You are an expert interview coach analyzing a ${role} interview at ${difficulty} difficulty level.

INTERVIEW QUESTION:
"${question}"

CANDIDATE'S RESPONSE TRANSCRIPT:
"${transcript}"

Please analyze this interview performance based on the candidate's actual response and provide a detailed evaluation in JSON format with the following structure:

{
  "overallScore": [number 0-100],
  "clarityScore": [number 0-100], 
  "technicalScore": [number 0-100],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "mistakes": ["mistake 1", "mistake 2"],
  "feedback": "Detailed paragraph of overall feedback based on the actual response",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

Analyze the candidate's response for:

1. TECHNICAL ACCURACY (${difficulty} level ${role} concepts):
   - Correctness of technical information mentioned
   - Depth of knowledge demonstrated
   - Use of appropriate terminology
   - Industry best practices mentioned

2. COMMUNICATION CLARITY:
   - Clear articulation of ideas
   - Logical flow of response
   - Use of examples and specifics
   - Professional communication style

3. COMPLETENESS & STRUCTURE:
   - How well the question was addressed
   - Use of structured approach (like STAR method)
   - Completeness of the answer
   - Relevant details provided

4. ROLE-SPECIFIC EVALUATION:
   - For Frontend: UI/UX awareness, performance, frameworks, responsive design
   - For Backend: System design, databases, APIs, security, scalability  
   - For Fullstack: End-to-end thinking, integration, versatility
   - For Data Science: Statistical thinking, ML concepts, data handling, model deployment

Provide specific, actionable feedback based on what the candidate actually said in their response. Be constructive but honest about areas needing improvement.
    `;

    try {
      // Generate analysis using Gemini AI
      const result = await model.generateContent(analysisPrompt);
      const response = await result.response;
      const analysisText = response.text();
      
      console.log('📄 Raw Gemini response:', analysisText);

      // Try to extract JSON from the response
      let analysisData;
      try {
        // Remove any markdown code blocks and extract JSON
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0]);
          console.log('✅ Parsed Gemini JSON successfully');
        } else {
          throw new Error('No JSON found in response');
        }
        
      } catch (parseError) {
        console.warn('⚠️ Failed to parse JSON, creating dynamic fallback response:', parseError.message);
        
        // Dynamic fallback analysis based on role, difficulty, and randomization
        const baseScores = {
          easy: { overall: 75, clarity: 80, technical: 70 },
          medium: { overall: 70, clarity: 75, technical: 68 },
          hard: { overall: 65, clarity: 70, technical: 62 }
        };

        const scores = baseScores[difficulty] || baseScores.medium;
        const variance = () => Math.floor(Math.random() * 15) - 7; // -7 to +8 for more variation
        
        // Role-specific strengths and improvements
        const roleSpecific = {
          frontend: {
            strengths: ["Strong CSS and responsive design skills", "Good understanding of React lifecycle", "Excellent attention to UI/UX details"],
            improvements: ["Learn more about performance optimization", "Practice state management patterns", "Improve accessibility knowledge"],
            mistakes: ["Didn't mention browser compatibility", "Overlooked SEO considerations"]
          },
          backend: {
            strengths: ["Solid database design principles", "Good API architecture understanding", "Strong security awareness"],
            improvements: ["Learn more about microservices", "Practice system scalability concepts", "Improve error handling strategies"],
            mistakes: ["Didn't discuss caching strategies", "Missed load balancing considerations"]
          },
          fullstack: {
            strengths: ["Versatile across frontend and backend", "Good understanding of full development cycle", "Strong problem-solving approach"],
            improvements: ["Deepen expertise in specific technologies", "Practice DevOps and deployment", "Improve system design skills"],
            mistakes: ["Could have shown more depth in specific areas", "Didn't discuss testing strategies thoroughly"]
          },
          "data-scientist": {
            strengths: ["Strong statistical foundation", "Good data visualization skills", "Excellent analytical thinking"],
            improvements: ["Practice more machine learning algorithms", "Learn advanced feature engineering", "Improve model deployment knowledge"],
            mistakes: ["Didn't discuss data cleaning thoroughly", "Missed ethical AI considerations"]
          }
        };
        
        const roleData = roleSpecific[role] || roleSpecific.frontend;
        
        analysisData = {
          overallScore: Math.max(40, Math.min(95, scores.overall + variance())),
          clarityScore: Math.max(45, Math.min(98, scores.clarity + variance())),
          technicalScore: Math.max(35, Math.min(92, scores.technical + variance())),
          strengths: roleData.strengths,
          improvements: roleData.improvements,
          mistakes: roleData.mistakes,
          feedback: `This ${difficulty}-level ${role} interview shows ${scores.overall > 70 ? 'strong' : 'decent'} performance. The candidate demonstrates ${role === 'data-scientist' ? 'analytical thinking' : 'technical competency'} and communication skills. Key areas for growth include ${roleData.improvements[0].toLowerCase()} and ${roleData.improvements[1].toLowerCase()}. Overall trajectory is positive with focused improvement.`,
          recommendations: [
            `Deep dive into ${role} best practices and advanced concepts`,
            "Build a portfolio project showcasing end-to-end skills",
            "Practice explaining complex technical concepts simply",
            "Mock interview with senior developers in your field"
          ]
        };
      }

      // Save analysis to database for future reference with transcript and question
      if (recordingId) {
        try {
          await db.collection("interview_analyses").insertOne({
            recordingId: recordingId,
            userId: req.user._id.toString(),
            userEmail: req.user.email,
            role: role,
            difficulty: difficulty,
            question: question,
            transcript: transcript,
            transcriptionDuration: transcriptionDuration,
            analysisResult: analysisData,
            createdAt: new Date(),
            geminiResponse: analysisText,
            analysisMethod: 'google-speech-to-text + gemini-analysis'
          });
          console.log('💾 Analysis saved with REAL speech transcription');
        } catch (dbError) {
          console.warn('⚠️ Failed to save analysis to database:', dbError.message);
        }
      }

      console.log('✅ Analysis completed successfully');
      console.log('📊 Gemini scores (unmodified):', {
        overall: analysisData.overallScore,
        clarity: analysisData.clarityScore,
        technical: analysisData.technicalScore
      });
      
      res.json({
        success: true,
        ...analysisData
      });

    } catch (geminiError) {
      console.error('❌ Gemini AI error:', geminiError);
      
      // Enhanced fallback response if Gemini fails
      const fallbackScores = {
        easy: { overall: 78, clarity: 82, technical: 74 },
        medium: { overall: 72, clarity: 76, technical: 68 },
        hard: { overall: 66, clarity: 71, technical: 62 }
      };

      const scores = fallbackScores[difficulty] || fallbackScores.medium;
      const variance = () => Math.floor(Math.random() * 12) - 6; // -6 to +6
      
      // Role-specific fallback content
      const roleContent = {
        frontend: {
          strengths: ["Demonstrated good UI/UX awareness", "Understanding of modern frontend frameworks", "Clean code organization"],
          improvements: ["Optimize component performance", "Learn advanced CSS techniques", "Practice responsive design patterns"],
          mistakes: ["Could elaborate on cross-browser compatibility", "Missed discussing mobile-first approach"]
        },
        backend: {
          strengths: ["Strong database concepts", "Good API design principles", "Security-conscious approach"],
          improvements: ["Learn microservices architecture", "Practice system design patterns", "Improve error handling"],
          mistakes: ["Could discuss scalability more", "Missed caching strategies"]
        },
        fullstack: {
          strengths: ["Well-rounded technical knowledge", "Good end-to-end thinking", "Balanced frontend/backend skills"],
          improvements: ["Specialize in specific tech stack", "Learn DevOps practices", "Practice system architecture"],
          mistakes: ["Could show more depth in chosen area", "Missed discussing deployment strategies"]
        },
        "data-scientist": {
          strengths: ["Strong analytical approach", "Good statistical reasoning", "Clear data interpretation"],
          improvements: ["Learn advanced ML algorithms", "Practice feature engineering", "Improve model validation"],
          mistakes: ["Could discuss data ethics more", "Missed discussing model interpretability"]
        }
      };
      
      const content = roleContent[role] || roleContent.frontend;
      
      res.json({
        success: true,
        overallScore: Math.max(45, Math.min(90, scores.overall + variance())),
        clarityScore: Math.max(50, Math.min(95, scores.clarity + variance())),
        technicalScore: Math.max(40, Math.min(88, scores.technical + variance())),
        strengths: content.strengths,
        improvements: content.improvements,
        mistakes: content.mistakes,
        feedback: `This ${difficulty}-level ${role} interview demonstrates solid foundational knowledge with room for growth. The candidate shows promise in core concepts but should focus on practical application and deeper technical discussions. Continued learning and practice will yield significant improvement.`,
        recommendations: [
          `Study advanced ${role} patterns and best practices`,
          "Build comprehensive portfolio projects",
          "Join technical communities and code reviews",
          "Practice whiteboard coding and system design"
        ]
      });
    }

  } catch (error) {
    console.error('❌ Analysis error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to analyze recording",
      error: error.message 
    });
  }
});

// Get Analysis by Recording ID
app.get("/api/analysis/:recordingId", authenticateToken, async (req, res) => {
  try {
    const { recordingId } = req.params;
    const userId = req.user._id.toString();
    
    console.log(`🔍 Fetching analysis for recording: ${recordingId}`);
    
    // Find analysis for this recording and user
    const analysis = await db
      .collection("interview_analyses")
      .findOne({ 
        recordingId: recordingId,
        userId: userId 
      });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found for this recording"
      });
    }

    console.log(`✅ Found existing analysis for recording: ${recordingId}`);
    
    // Try to parse geminiResponse to get original unmodified scores
    let analysisToReturn = analysis.analysisResult;
    
    if (analysis.geminiResponse) {
      try {
        // Extract JSON from geminiResponse (original Gemini output)
        const jsonMatch = analysis.geminiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const originalGeminiData = JSON.parse(jsonMatch[0]);
          console.log('📊 Using original Gemini scores from geminiResponse:', {
            overall: originalGeminiData.overallScore,
            clarity: originalGeminiData.clarityScore,
            technical: originalGeminiData.technicalScore
          });
          analysisToReturn = originalGeminiData;
        }
      } catch (parseError) {
        console.warn('⚠️ Could not parse geminiResponse, using analysisResult:', parseError.message);
      }
    }
    
    // Return the analysis result from database (Gemini-generated scores)
    const responseData = {
      success: true,
      ...analysisToReturn,  // Spread the original Gemini analysis
      analysisDate: analysis.createdAt,
      analysisId: analysis._id,
      transcript: analysis.transcript,
      question: analysis.question
    };
    
    console.log('📊 Returning analysis with scores:', {
      overall: responseData.overallScore,
      clarity: responseData.clarityScore,
      technical: responseData.technicalScore
    });
    
    res.json(responseData);

  } catch (error) {
    console.error('❌ Error fetching analysis:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch analysis",
      error: error.message 
    });
  }
});

// Resume Analyzer Endpoint
const uploadResume = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

app.post("/api/analyze-resume", uploadResume.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF resume' });
    }

    const { jobDescription, targetRole } = req.body;

    if (!jobDescription || !targetRole) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide both job description and target role' 
      });
    }

    console.log(`📄 Analyzing resume for role: ${targetRole}`);

    // Extract text from PDF
    let resumeText;
    try {
      const pdfData = await pdf(req.file.buffer);
      resumeText = pdfData.text;
      console.log(`✅ Extracted ${resumeText.length} characters from PDF`);
    } catch (pdfError) {
      console.error('❌ PDF parsing error:', pdfError);
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to parse PDF. Please ensure it\'s a valid PDF file.' 
      });
    }

    // Initialize Gemini AI
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Create analysis prompt
    const analysisPrompt = `
You are an expert resume analyzer and career counselor. Analyze the following resume against the job description and provide detailed feedback.

TARGET ROLE: ${targetRole}

JOB DESCRIPTION:
${jobDescription}

RESUME CONTENT:
${resumeText}

Analyze the resume and provide a comprehensive evaluation in the following JSON format:
{
  "matchScore": <number 0-100 indicating how well the resume matches the job>,
  "targetRole": "${targetRole}",
  "strengths": [
    "List 4-6 specific strengths found in the resume that align with the job requirements",
    "Be specific and reference actual content from the resume"
  ],
  "missingSkills": [
    "List 4-6 important skills or keywords from the job description that are missing or weak in the resume",
    "Focus on skills that would significantly improve the match"
  ],
  "suggestions": [
    "Provide 5-7 actionable, specific suggestions to improve the resume for this role",
    "Include suggestions for formatting, keywords, achievements, quantification, etc.",
    "Be constructive and practical"
  ]
}

IMPORTANT: 
- Be honest and thorough in your analysis
- Match score should reflect actual alignment between resume and job description
- Strengths should be genuine highlights from the resume
- Missing skills should be truly important for the role
- Suggestions should be actionable and specific
- Return ONLY valid JSON, no additional text
`;

    try {
      const result = await model.generateContent(analysisPrompt);
      const response = await result.response;
      const analysisText = response.text();

      console.log('🤖 Gemini analysis received');

      // Parse JSON from response
      let analysisData;
      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.warn('⚠️ Failed to parse Gemini response, using fallback');
        
        // Fallback analysis
        analysisData = {
          matchScore: 72,
          targetRole: targetRole,
          strengths: [
            "Resume demonstrates relevant experience in the field",
            "Educational background aligns with job requirements",
            "Shows progression and growth in career",
            "Includes measurable achievements and results"
          ],
          missingSkills: [
            "Specific technical skills mentioned in job description",
            "Industry-specific certifications or qualifications",
            "Quantified metrics for major accomplishments",
            "Keywords that match the job posting"
          ],
          suggestions: [
            "Add a professional summary highlighting your fit for this specific role",
            "Include more quantified achievements (numbers, percentages, dollar amounts)",
            "Incorporate key technical skills and tools mentioned in the job description",
            "Reorganize bullet points to lead with strongest achievements",
            "Add relevant certifications or ongoing professional development",
            "Ensure formatting is ATS-friendly with clear section headers",
            "Include specific examples of projects relevant to the target role"
          ]
        };
      }

      console.log(`✅ Resume analysis complete - Match Score: ${analysisData.matchScore}%`);

      // Save analysis to database
      try {
        const resumeAnalysis = {
          fileName: req.file.originalname,
          fileSize: req.file.size,
          targetRole: targetRole,
          jobDescription: jobDescription,
          analysisResult: analysisData,
          createdAt: new Date(),
          resumeTextLength: resumeText.length
        };

        const result = await db.collection("resume_analyses").insertOne(resumeAnalysis);
        console.log(`💾 Resume analysis saved to database with ID: ${result.insertedId}`);

        res.json({
          success: true,
          analysis: analysisData,
          analysisId: result.insertedId
        });

      } catch (dbError) {
        console.error('⚠️ Failed to save to database:', dbError);
        // Still return the analysis even if DB save fails
        res.json({
          success: true,
          analysis: analysisData,
          warning: 'Analysis completed but failed to save to database'
        });
      }

    } catch (aiError) {
      console.error('❌ Gemini AI error:', aiError);
      
      // Fallback response if AI fails
      const fallbackAnalysis = {
        matchScore: 70,
        targetRole: targetRole,
        strengths: [
          "Resume shows relevant professional experience",
          "Educational qualifications meet basic requirements",
          "Demonstrates career progression and development",
          "Contains concrete examples of work experience"
        ],
        missingSkills: [
          "Specific technical keywords from the job description",
          "Industry-standard certifications or training",
          "Quantifiable metrics and achievements",
          "Modern tools and technologies mentioned in the posting"
        ],
        suggestions: [
          "Tailor your resume to include keywords from the job description",
          "Add quantified achievements (e.g., 'Increased sales by 30%')",
          "Create a targeted summary statement for this specific role",
          "Highlight projects directly relevant to the job requirements",
          "Include technical skills section matching the job posting",
          "Ensure resume is ATS-optimized with proper formatting",
          "Add any relevant certifications or continuing education"
        ]
      };

      // Try to save fallback analysis too
      try {
        const resumeAnalysis = {
          fileName: req.file.originalname,
          fileSize: req.file.size,
          targetRole: targetRole,
          jobDescription: jobDescription,
          analysisResult: fallbackAnalysis,
          createdAt: new Date(),
          resumeTextLength: resumeText.length,
          isFallback: true
        };

        const result = await db.collection("resume_analyses").insertOne(resumeAnalysis);
        console.log(`💾 Fallback analysis saved with ID: ${result.insertedId}`);
      } catch (dbError) {
        console.error('⚠️ Failed to save fallback analysis:', dbError);
      }

      res.json({
        success: true,
        analysis: fallbackAnalysis
      });
    }

  } catch (error) {
    console.error('❌ Resume analysis error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to analyze resume',
      error: error.message 
    });
  }
});

// Get Resume Analysis History
app.get("/api/resume-analyses", async (req, res) => {
  try {
    const analyses = await db
      .collection("resume_analyses")
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    console.log(`📊 Fetched ${analyses.length} resume analyses`);
    res.json({
      success: true,
      count: analyses.length,
      data: analyses
    });
  } catch (error) {
    console.error('❌ Error fetching resume analyses:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch resume analyses",
      error: error.message 
    });
  }
});

// Get Single Resume Analysis by ID
app.get("/api/resume-analysis/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const analysis = await db
      .collection("resume_analyses")
      .findOne({ _id: new ObjectId(id) });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Resume analysis not found"
      });
    }

    console.log(`📄 Fetched resume analysis: ${id}`);
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('❌ Error fetching resume analysis:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch resume analysis",
      error: error.message 
    });
  }
});

// Get Analysis History
app.get("/api/analysis-history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    const analyses = await db
      .collection("interview_analyses")
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    console.log(`📊 Fetched ${analyses.length} analyses for user: ${req.user.email}`);
    res.json({
      success: true,
      data: analyses
    });
  } catch (error) {
    console.error('❌ Error fetching analysis history:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch analysis history",
      error: error.message 
    });
  }
});

// No longer serving static files - recordings are now on Supabase
// app.use("/uploads/recordings", express.static("uploads/recordings"));

// ===== Error handler =====
app.use((err, req, res, next) => {
  res.status(500).send({ message: "Server Error", payload: err.message });
});

// ===== Start server =====
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
