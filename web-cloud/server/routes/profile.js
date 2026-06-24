const express = require('express');
const { ObjectId } = require('mongodb');
const { hashPassword, comparePassword } = require('../auth');
const multer = require('multer');
const { uploadToSupabase, deleteFromSupabase } = require('../utils/storageService');

const router = express.Router();

// Multer setup for profile image uploads
const uploadProfileImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile images
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image files are allowed.'), false);
    }
  }
});

// Profile routes need authentication middleware passed from server.js
let db;

const initProfileRoutes = (database) => {
  db = database;
  return router;
};

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user data with profile information
    const userProfile = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { 
        projection: { 
          password: 0 // Exclude password from response
        } 
      }
    );

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Get additional profile stats
    const stats = await db.collection('interview_responses').aggregate([
      { $match: { userId: new ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalInterviews: { $sum: 1 },
          averageConfidence: { $avg: '$response.confidence' },
          totalTimeSpent: { $sum: '$response.timeSpent' },
          averageWordCount: { $avg: '$response.wordCount' }
        }
      }
    ]).toArray();

    const profileStats = stats[0] || {
      totalInterviews: 0,
      averageConfidence: 0,
      totalTimeSpent: 0,
      averageWordCount: 0
    };

    res.json({
      success: true,
      data: {
        profile: userProfile,
        stats: profileStats
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
});

// Update personal information
router.put('/profile/personal', async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      firstName,
      lastName,
      currentPosition,
      experience,
      skills,
      company,
      country,
      about
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required'
      });
    }

    // Prepare update data
    const updateData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: `${firstName.trim()} ${lastName.trim()}`,
      updatedAt: new Date()
    };

    // Add optional fields if provided
    if (currentPosition !== undefined) updateData.currentPosition = currentPosition.trim();
    if (experience !== undefined) updateData.experience = experience.trim();
    if (skills !== undefined) updateData.skills = skills.trim();
    if (company !== undefined) updateData.company = company.trim();
    if (country !== undefined) updateData.country = country;
    if (about !== undefined) updateData.about = about.trim();

    // Update user profile
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get updated user data
    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    res.json({
      success: true,
      message: 'Personal information updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error updating personal information:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update personal information',
      error: error.message
    });
  }
});

// Update education information
router.put('/profile/education', async (req, res) => {
  try {
    const userId = req.user._id;
    const { school, degree, graduationDate } = req.body;

    const updateData = {
      education: {
        school: school ? school.trim() : '',
        degree: degree ? degree.trim() : '',
        graduationDate: graduationDate ? graduationDate.trim() : ''
      },
      updatedAt: new Date()
    };

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get updated user data
    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    res.json({
      success: true,
      message: 'Education information updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error updating education information:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update education information',
      error: error.message
    });
  }
});

// Reset password
router.put('/profile/password', async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'All password fields are required'
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Get current user
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has a password (OAuth users might not have one)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change password for OAuth accounts. Please use your OAuth provider to manage your password.'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          password: hashedNewPassword,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: error.message
    });
  }
});

// Update email
router.put('/profile/email', async (req, res) => {
  try {
    const userId = req.user._id;
    const { newEmail } = req.body;

    // Validate input
    if (!newEmail) {
      return res.status(400).json({
        success: false,
        message: 'New email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if email already exists
    const existingUser = await db.collection('users').findOne({ 
      email: newEmail.toLowerCase().trim(),
      _id: { $ne: new ObjectId(userId) }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This email is already associated with another account'
      });
    }

    // Update email
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          email: newEmail.toLowerCase().trim(),
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get updated user data
    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    res.json({
      success: true,
      message: 'Email updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update email',
      error: error.message
    });
  }
});

// Upload profile image
router.post('/profile/image', uploadProfileImage.single('profileImage'), async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Generate unique filename
    const filename = `profile-${userId}-${Date.now()}.${req.file.mimetype.split('/')[1]}`;

    // Upload to Supabase
    const uploadResult = await uploadToSupabase(
      req.file.buffer,
      filename,
      'profile-images',
      req.file.mimetype
    );

    if (!uploadResult.success) {
      console.error('Upload to Supabase failed:', uploadResult.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload profile image',
        error: uploadResult.error
      });
    }

    // Get current user to delete old profile image if exists
    const currentUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    
    // Delete old profile image from Supabase if exists
    if (currentUser && currentUser.profileImage && currentUser.profileImage.path) {
      await deleteFromSupabase(currentUser.profileImage.path, 'profile-images');
    }

    // Update user with new profile image
    const profileImageData = {
      url: uploadResult.url,
      path: uploadResult.path,
      filename: filename,
      uploadedAt: new Date()
    };

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          profileImage: profileImageData,
          imageUrl: uploadResult.url, // For backward compatibility
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        profileImage: profileImageData
      }
    });

  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image',
      error: error.message
    });
  }
});

// Delete profile image
router.delete('/profile/image', async (req, res) => {
  try {
    const userId = req.user._id;

    // Get current user
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete from Supabase if profile image exists
    if (user.profileImage && user.profileImage.path) {
      await deleteFromSupabase(user.profileImage.path, 'profile-images');
    }

    // Remove profile image from user document
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $unset: { 
          profileImage: "",
          imageUrl: "" // For backward compatibility
        },
        $set: {
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Failed to delete profile image'
      });
    }

    res.json({
      success: true,
      message: 'Profile image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting profile image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile image',
      error: error.message
    });
  }
});

// Get friends/connections (Social feature)
router.get('/profile/friends', async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get user's friends/connections
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If user has friends list
    let friends = [];
    let totalCount = 0;

    if (user.friends && user.friends.length > 0) {
      const friendIds = user.friends.map(friendId => new ObjectId(friendId));
      
      totalCount = friendIds.length;
      
      friends = await db.collection('users').find(
        { _id: { $in: friendIds.slice(skip, skip + parseInt(limit)) } },
        {
          projection: {
            firstName: 1,
            lastName: 1,
            name: 1,
            email: 1,
            profileImage: 1,
            imageUrl: 1,
            currentPosition: 1,
            company: 1,
            createdAt: 1
          }
        }
      ).toArray();
    }

    // For demo purposes, if no friends exist, return some sample connections
    if (friends.length === 0) {
      friends = [
        {
          _id: 'demo1',
          name: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          currentPosition: 'Software Engineer',
          company: 'Tech Corp',
          profileImage: { url: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
          connectionDate: new Date()
        },
        {
          _id: 'demo2',
          name: 'Jane Smith',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          currentPosition: 'Product Manager',
          company: 'Innovation Inc',
          profileImage: { url: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
          connectionDate: new Date()
        }
      ];
      totalCount = friends.length;
    }

    res.json({
      success: true,
      data: {
        friends,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNext: skip + friends.length < totalCount,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch friends',
      error: error.message
    });
  }
});

// Get user's activity/achievements
router.get('/profile/activity', async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    // Get recent interview responses
    const recentInterviews = await db.collection('interview_responses').find(
      { userId: new ObjectId(userId) },
      { sort: { 'metadata.createdAt': -1 }, limit: parseInt(limit) }
    ).toArray();

    // Get performance analytics
    const performanceStats = await db.collection('interview_responses').aggregate([
      { $match: { userId: new ObjectId(userId) } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$metadata.createdAt" }
          },
          count: { $sum: 1 },
          avgConfidence: { $avg: "$response.confidence" },
          avgWordCount: { $avg: "$response.wordCount" }
        }
      },
      { $sort: { "_id": -1 } },
      { $limit: 30 } // Last 30 days
    ]).toArray();

    // Get achievements (mock data for now)
    const achievements = [
      {
        id: 'first_interview',
        title: 'First Interview Completed',
        description: 'Completed your first mock interview',
        icon: '🎯',
        unlockedAt: recentInterviews.length > 0 ? recentInterviews[recentInterviews.length - 1].metadata.createdAt : null,
        unlocked: recentInterviews.length > 0
      },
      {
        id: 'confident_speaker',
        title: 'Confident Speaker',
        description: 'Achieved 80%+ confidence in 5 interviews',
        icon: '💪',
        unlocked: recentInterviews.filter(r => r.response.confidence >= 0.8).length >= 5,
        unlockedAt: recentInterviews.length >= 5 ? new Date() : null
      },
      {
        id: 'regular_practice',
        title: 'Regular Practice',
        description: 'Completed 10 interviews',
        icon: '🔥',
        unlocked: recentInterviews.length >= 10,
        unlockedAt: recentInterviews.length >= 10 ? new Date() : null
      }
    ];

    res.json({
      success: true,
      data: {
        recentInterviews: recentInterviews.map(interview => ({
          id: interview._id,
          question: interview.question.text,
          category: interview.question.category,
          difficulty: interview.question.difficulty,
          confidence: interview.response.confidence,
          wordCount: interview.response.wordCount,
          timeSpent: interview.response.timeSpent,
          timestamp: interview.metadata.createdAt
        })),
        performanceStats,
        achievements
      }
    });

  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity',
      error: error.message
    });
  }
});

// Delete user account (with proper data cleanup)
router.delete('/profile/account', async (req, res) => {
  try {
    const userId = req.user._id;
    const { confirmDelete } = req.body;

    if (!confirmDelete || confirmDelete !== 'DELETE_MY_ACCOUNT') {
      return res.status(400).json({
        success: false,
        message: 'Please confirm account deletion by sending confirmDelete: "DELETE_MY_ACCOUNT"'
      });
    }

    // Get user data first
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user's profile image from Supabase
    if (user.profileImage && user.profileImage.path) {
      await deleteFromSupabase(user.profileImage.path, 'profile-images');
    }

    // Start transaction to delete all user data
    const session = db.client?.startSession();
    
    try {
      if (session) {
        await session.withTransaction(async () => {
          // Delete all user's interview responses
          await db.collection('interview_responses').deleteMany({ userId: new ObjectId(userId) });
          
          // Delete all user's recordings
          await db.collection('recordings').deleteMany({ userId: new ObjectId(userId) });
          
          // Delete contact submissions if any
          await db.collection('contact_submissions').deleteMany({ userId: new ObjectId(userId) });
          
          // Finally delete user account
          await db.collection('users').deleteOne({ _id: new ObjectId(userId) });
        });
      } else {
        // Fallback without session if not available
        await db.collection('interview_responses').deleteMany({ userId: new ObjectId(userId) });
        await db.collection('recordings').deleteMany({ userId: new ObjectId(userId) });
        await db.collection('contact_submissions').deleteMany({ userId: new ObjectId(userId) });
        await db.collection('users').deleteOne({ _id: new ObjectId(userId) });
      }

      res.json({
        success: true,
        message: 'Account and all associated data have been permanently deleted'
      });

    } finally {
      if (session) {
        await session.endSession();
      }
    }

  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
});

module.exports = { initProfileRoutes };