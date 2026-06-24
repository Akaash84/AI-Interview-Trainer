const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const router = express.Router();

const TEMP_DIR = path.join(__dirname, '../temp');

// Ensure temp directory exists
async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create temp directory:', error);
  }
}

ensureTempDir();

// Execute Python code
async function executePython(code) {
  const tempId = crypto.randomBytes(16).toString('hex');
  const filePath = path.join(TEMP_DIR, `${tempId}.py`);
  
  try {
    await fs.writeFile(filePath, code);
    
    return new Promise((resolve) => {
      const process = spawn('python3', [filePath], { timeout: 10000 });
      let output = '';
      let error = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      process.on('close', async (code) => {
        try {
          await fs.unlink(filePath);
        } catch (e) {}
        
        resolve({
          success: code === 0 && !error,
          output: error || output || 'No output',
          exitCode: code
        });
      });
      
      process.on('error', async (err) => {
        try {
          await fs.unlink(filePath);
        } catch (e) {}
        
        resolve({
          success: false,
          output: `Execution error: ${err.message}`,
          exitCode: -1
        });
      });
    });
  } catch (error) {
    return {
      success: false,
      output: `File operation error: ${error.message}`,
      exitCode: -1
    };
  }
}

// Execute Java code
async function executeJava(code) {
  const tempId = crypto.randomBytes(16).toString('hex');
  const className = extractJavaClassName(code) || 'Main';
  const filePath = path.join(TEMP_DIR, `${className}.java`);
  const classPath = path.join(TEMP_DIR, `${className}.class`);
  
  try {
    await fs.writeFile(filePath, code);
    
    // Compile
    const compileResult = await new Promise((resolve) => {
      const compileProcess = spawn('javac', [filePath], { timeout: 10000 });
      let error = '';
      
      compileProcess.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      compileProcess.on('close', (code) => {
        resolve({ success: code === 0, error });
      });
      
      compileProcess.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });
    });
    
    if (!compileResult.success) {
      await cleanup([filePath, classPath]);
      return {
        success: false,
        output: `Compilation error: ${compileResult.error}`,
        exitCode: -1
      };
    }
    
    // Execute
    return new Promise((resolve) => {
      const process = spawn('java', ['-cp', TEMP_DIR, className], { timeout: 10000 });
      let output = '';
      let error = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      process.on('close', async (code) => {
        await cleanup([filePath, classPath]);
        
        resolve({
          success: code === 0 && !error,
          output: error || output || 'No output',
          exitCode: code
        });
      });
      
      process.on('error', async (err) => {
        await cleanup([filePath, classPath]);
        
        resolve({
          success: false,
          output: `Execution error: ${err.message}`,
          exitCode: -1
        });
      });
    });
  } catch (error) {
    return {
      success: false,
      output: `File operation error: ${error.message}`,
      exitCode: -1
    };
  }
}

// Execute C++ code
async function executeCpp(code) {
  const tempId = crypto.randomBytes(16).toString('hex');
  const sourceFile = path.join(TEMP_DIR, `${tempId}.cpp`);
  const executableFile = path.join(TEMP_DIR, `${tempId}`);
  
  try {
    await fs.writeFile(sourceFile, code);
    
    // Compile
    const compileResult = await new Promise((resolve) => {
      const compileProcess = spawn('g++', ['-o', executableFile, sourceFile], { timeout: 10000 });
      let error = '';
      
      compileProcess.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      compileProcess.on('close', (code) => {
        resolve({ success: code === 0, error });
      });
      
      compileProcess.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });
    });
    
    if (!compileResult.success) {
      await cleanup([sourceFile, executableFile]);
      return {
        success: false,
        output: `Compilation error: ${compileResult.error}`,
        exitCode: -1
      };
    }
    
    // Execute
    return new Promise((resolve) => {
      const process = spawn(executableFile, [], { timeout: 10000 });
      let output = '';
      let error = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      process.on('close', async (code) => {
        await cleanup([sourceFile, executableFile]);
        
        resolve({
          success: code === 0 && !error,
          output: error || output || 'No output',
          exitCode: code
        });
      });
      
      process.on('error', async (err) => {
        await cleanup([sourceFile, executableFile]);
        
        resolve({
          success: false,
          output: `Execution error: ${err.message}`,
          exitCode: -1
        });
      });
    });
  } catch (error) {
    return {
      success: false,
      output: `File operation error: ${error.message}`,
      exitCode: -1
    };
  }
}

// Execute Node.js code (JavaScript/TypeScript)
async function executeNode(code, language) {
  const tempId = crypto.randomBytes(16).toString('hex');
  const extension = language.toLowerCase() === 'typescript' ? 'ts' : 'js';
  const filePath = path.join(TEMP_DIR, `${tempId}.${extension}`);
  
  try {
    await fs.writeFile(filePath, code);
    
    const command = language.toLowerCase() === 'typescript' ? 'ts-node' : 'node';
    
    return new Promise((resolve) => {
      const process = spawn(command, [filePath], { timeout: 10000 });
      let output = '';
      let error = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      process.on('close', async (code) => {
        try {
          await fs.unlink(filePath);
        } catch (e) {}
        
        resolve({
          success: code === 0 && !error,
          output: error || output || 'No output',
          exitCode: code
        });
      });
      
      process.on('error', async (err) => {
        try {
          await fs.unlink(filePath);
        } catch (e) {}
        
        resolve({
          success: false,
          output: `Execution error: ${err.message}`,
          exitCode: -1
        });
      });
    });
  } catch (error) {
    return {
      success: false,
      output: `File operation error: ${error.message}`,
      exitCode: -1
    };
  }
}

// Helper functions
function extractJavaClassName(code) {
  const match = code.match(/public\s+class\s+(\w+)/);
  return match ? match[1] : null;
}

async function cleanup(files) {
  for (const file of files) {
    try {
      await fs.unlink(file);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

// API endpoint
router.post('/execute', async (req, res) => {
  const { code, language } = req.body;
  
  if (!code || !language) {
    return res.status(400).json({
      success: false,
      output: 'Missing code or language parameter'
    });
  }
  
  try {
    let result;
    
    switch (language.toLowerCase()) {
      case 'python':
        result = await executePython(code);
        break;
      case 'javascript':
        result = await executeNode(code, language);
        break;
      case 'java':
        try {
          result = await executeJava(code);
        } catch (error) {
          result = {
            success: false,
            output: 'Java compiler not available on this server. Try JavaScript or Python instead.'
          };
        }
        break;
      case 'cpp':
      case 'c++':
        try {
          result = await executeCpp(code);
        } catch (error) {
          result = {
            success: false,
            output: 'C++ compiler not available on this server. Try JavaScript or Python instead.'
          };
        }
        break;
      case 'typescript':
        result = {
          success: false,
          output: 'TypeScript not available. Try JavaScript instead.'
        };
        break;
      default:
        result = {
          success: false,
          output: `Language '${language}' is not supported`
        };
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      output: `Server error: ${error.message}`
    });
  }
});

module.exports = router;
