const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

const JWT_SECRET = process.env.JWT_SECRET || 'askarthikey';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Create auth functions that accept database
const createAuthFunctions = (db) => {
  // Sign up with email and password
  const signUp = async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validate input
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
      }

      // Check if user already exists
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        createdAt: new Date(),
        provider: 'email'
      };

      const result = await db.collection('users').insertOne(user);
      const userId = result.insertedId;

      // Generate token
      const token = generateToken(userId);

      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user;
      userWithoutPassword._id = userId;

      res.status(201).json({
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Sign up error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Sign in with email and password
  const signIn = async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user
      const user = await db.collection('users').findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Check if user signed up with OAuth
      if (user.provider !== 'email') {
        return res.status(400).json({ 
          message: `This account was created with ${user.provider}. Please sign in with ${user.provider}.` 
        });
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Generate token
      const token = generateToken(user._id);

      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Sign in error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Validate token
  const validateToken = async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      console.log('Token validation attempt:', {
        hasToken: !!token,
        tokenStart: token ? token.substring(0, 10) + '...' : 'none',
        headers: req.headers.authorization ? 'present' : 'missing'
      });
      
      if (!token) {
        console.log('Validation failed: No token provided');
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        console.log('Validation failed: Invalid token');
        return res.status(401).json({ message: 'Invalid token' });
      }

      console.log('Token decoded successfully for user:', decoded.userId);

      // Find user
      const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
      if (!user) {
        console.log('Validation failed: User not found for ID:', decoded.userId);
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('User found and validated:', user.email);

      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user;

      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };

  return { signUp, signIn, validateToken };
};

module.exports = {
  createAuthFunctions,
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword
};
