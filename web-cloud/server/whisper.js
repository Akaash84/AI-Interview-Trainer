const multer = require('multer');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Ensure dotenv is loaded
require('dotenv').config();

// Debug: Check if API key is loaded
console.log('OpenAI API Key loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit (OpenAI Whisper limit)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm', 'audio/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

// Transcribe audio using OpenAI Whisper
async function transcribeAudio(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Create a temporary file from the buffer
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `audio_${Date.now()}.webm`);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    try {
      // Send to OpenAI Whisper for transcription
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-1",
        language: "en", // You can make this configurable
        response_format: "verbose_json", // Get detailed response with timestamps
        temperature: 0.0, // More deterministic results
      });

      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      // Return transcription result
      res.json({
        success: true,
        transcript: transcription.text,
        language: transcription.language,
        duration: transcription.duration,
        segments: transcription.segments || [],
      });

    } catch (openaiError) {
      // Clean up temp file on error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      
      console.error('OpenAI Whisper error:', openaiError);
      res.status(500).json({ 
        error: 'Transcription failed', 
        details: openaiError.message 
      });
    }

  } catch (error) {
    console.error('Transcription endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

// Real-time transcription for streaming audio
async function transcribeStream(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio chunk provided' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Create a temporary file from the buffer
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `stream_${Date.now()}.webm`);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    try {
      // Send to OpenAI Whisper for transcription
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-1",
        language: "en",
        response_format: "json",
        temperature: 0.0,
      });

      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      // Return transcription result
      res.json({
        success: true,
        transcript: transcription.text,
        isPartial: true, // Indicate this is a partial result
      });

    } catch (openaiError) {
      // Clean up temp file on error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      
      console.error('OpenAI Whisper stream error:', openaiError);
      res.status(500).json({ 
        error: 'Stream transcription failed', 
        details: openaiError.message 
      });
    }

  } catch (error) {
    console.error('Stream transcription endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

module.exports = {
  upload,
  transcribeAudio,
  transcribeStream,
};
