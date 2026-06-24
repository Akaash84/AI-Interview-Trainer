// Alternative code executor using external APIs
const express = require('express');
const axios = require('axios');

const router = express.Router();

// JDoodle API configuration (you'll need to sign up for API key)
const JDOODLE_API_URL = 'https://api.jdoodle.com/v1/execute';
const CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
const CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;

// Language mappings for JDoodle
const languageMap = {
  'python': 'python3',
  'java': 'java',
  'cpp': 'cpp17',
  'c++': 'cpp17',
  'javascript': 'nodejs',
  'typescript': 'nodejs'
};

router.post('/execute-remote', async (req, res) => {
  const { code, language } = req.body;
  
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.json({
      success: false,
      output: 'External code execution not configured. Please set up JDoodle API credentials.'
    });
  }
  
  try {
    const response = await axios.post(JDOODLE_API_URL, {
      script: code,
      language: languageMap[language.toLowerCase()] || language,
      versionIndex: "0",
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET
    });
    
    res.json({
      success: !response.data.error,
      output: response.data.output || response.data.error || 'No output',
      exitCode: response.data.statusCode
    });
  } catch (error) {
    res.json({
      success: false,
      output: `External execution error: ${error.message}`
    });
  }
});

module.exports = router;
