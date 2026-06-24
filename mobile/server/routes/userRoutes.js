const express = require('express');
const { validateUser, createUserObject } = require('../models/UserModel');

const router = express.Router();

// Create or update user after signup
router.post('/signup', async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName } = req.body;
    
    // Validate required fields
    const validation = validateUser({ clerkId, email });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const usersCollection = req.db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ 
      $or: [{ clerkId }, { email: email.toLowerCase().trim() }] 
    });

    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: 'User already exists',
        user: existingUser
      });
    }

    // Create new user
    const newUser = createUserObject({
      clerkId,
      email,
      firstName,
      lastName
    });

    const result = await usersCollection.insertOne(newUser);
    const savedUser = await usersCollection.findOne({ _id: result.insertedId });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: savedUser
    });

  } catch (error) {
    console.error('Error in signup:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email or Clerk ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Check user during signin
router.post('/signin', async (req, res) => {
  try {
    const { clerkId, email } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Clerk ID and email are required'
      });
    }

    const usersCollection = req.db.collection('users');

    // Find user in database
    const user = await usersCollection.findOne({
      $or: [{ clerkId }, { email: email.toLowerCase().trim() }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in database',
        shouldRedirectToSignup: true
      });
    }

    res.status(200).json({
      success: true,
      message: 'User found',
      user: user
    });

  } catch (error) {
    console.error('Error in signin:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get user by Clerk ID
router.get('/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;

    const usersCollection = req.db.collection('users');
    const user = await usersCollection.findOne({ clerkId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update user profile
router.put('/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated
    delete updateData.clerkId;
    delete updateData._id;
    delete updateData.createdAt;
    
    // Add updated timestamp
    updateData.updatedAt = new Date();

    const usersCollection = req.db.collection('users');
    
    const result = await usersCollection.findOneAndUpdate(
      { clerkId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: result
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
