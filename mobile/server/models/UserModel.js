// User model schema definition for MongoDB operations
const userSchema = {
  clerkId: {
    type: 'string',
    required: true,
    unique: true
  },
  email: {
    type: 'string',
    required: true,
    unique: true
  },
  firstName: {
    type: 'string',
    default: ''
  },
  lastName: {
    type: 'string',
    default: ''
  },
  currentRole: {
    type: 'string',
    default: ''
  },
  education: {
    type: 'string',
    default: ''
  },
  linkedinUrl: {
    type: 'string',
    default: ''
  },
  jobDescription: {
    type: 'string',
    default: ''
  },
  resume: {
    type: 'string', // This can store file path or URL to resume
    default: null
  },
  createdAt: {
    type: 'date',
    default: () => new Date()
  },
  updatedAt: {
    type: 'date',
    default: () => new Date()
  }
};

// Helper function to validate user data
const validateUser = (userData) => {
  const errors = [];
  
  if (!userData.clerkId) {
    errors.push('Clerk ID is required');
  }
  
  if (!userData.email) {
    errors.push('Email is required');
  }
  
  if (userData.email && !/\S+@\S+\.\S+/.test(userData.email)) {
    errors.push('Email format is invalid');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper function to create user object with defaults
const createUserObject = (userData) => {
  const now = new Date();
  return {
    clerkId: userData.clerkId,
    email: userData.email.toLowerCase().trim(),
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    currentRole: userData.currentRole || '',
    education: userData.education || '',
    linkedinUrl: userData.linkedinUrl || '',
    jobDescription: userData.jobDescription || '',
    resume: userData.resume || null,
    createdAt: now,
    updatedAt: now
  };
};

module.exports = {
  userSchema,
  validateUser,
  createUserObject
};
