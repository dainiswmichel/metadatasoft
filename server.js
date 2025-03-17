// server.js - Enhanced master server for DA1 development environment
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');

// Initialize error handler
const ErrorHandler = require('./lib/errorHandler');
const errorHandler = new ErrorHandler({
  logDirectory: path.join(__dirname, 'logs'),
  errorLogFile: 'error.log',
  debug: process.env.NODE_ENV === 'development'
});

// Load environment configuration
const ENV = process.env.NODE_ENV || 'development';
const config = require('./config')[ENV];

// Initialize the master server
const app = express();
const PORT = config.masterPort || 8000;

// Add middleware for API requests
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API documentation - requires swagger.json in config folder
try {
  const swaggerDocument = require('./config/swagger.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('📚 API documentation available at /api-docs');
} catch (error) {
  console.warn('⚠️ Swagger documentation not available:', error.message);
}

// Track active project servers
const activeServers = {};

// Middleware to load Google protection scripts
app.use((req, res, next) => {
  // Skip for API requests
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Path to Google protection script
  const googleProtectionScript = path.join(__dirname, 'dev-scripts', 'google-protection.js');
  
  // Check if the script exists and apply it
  if (fs.existsSync(googleProtectionScript)) {
    try {
      const protection = require(googleProtectionScript);
      protection(req, res, next);
    } catch (error) {
      console.error('Error loading Google protection script:', error);
      next();
    }
  } else {
    next();
  }
});

// ==============================================
// PROJECT MANAGEMENT API
// ==============================================

// API routes for managing projects
app.get('/api/projects', (req, res) => {
  // Get list of available projects
  const projectsDir = path.join(__dirname, 'projects');
  
  // Create projects directory if it doesn't exist
  if (!fs.existsSync(projectsDir)) {
    try {
      fs.mkdirSync(projectsDir, { recursive: true });
    } catch (error) {
      return res.status(500).json(
        errorHandler.createErrorResponse('INTERNAL_SERVER_ERROR', {}, { details: error.message })
      );
    }
  }
  
  fs.readdir(projectsDir, { withFileTypes: true }, (err, files) => {
    if (err) {
      return res.status(500).json(
        errorHandler.createErrorResponse('INTERNAL_SERVER_ERROR', {}, { details: err.message })
      );
    }
    
    const projects = files
      .filter(file => file.isDirectory())
      .map(dir => ({
        name: dir.name,
        active: activeServers[dir.name] ? true : false,
        port: activeServers[dir.name]?.port || null,
        pid: activeServers[dir.name]?.process?.pid || null,
        uptime: activeServers[dir.name]?.startTime 
          ? Math.floor((Date.now() - activeServers[dir.name].startTime) / 1000) 
          : null
      }));
    
    res.json(projects);
  });
});

// Start a project server
app.post('/api/projects/:project/start', (req, res) => {
  const { project } = req.params;
  const projectPath = path.join(__dirname, 'projects', project);
  
  if (!fs.existsSync(projectPath)) {
    return res.status(404).json(
      errorHandler.createErrorResponse('FILE_NOT_FOUND', { file: project })
    );
  }
  
  if (activeServers[project]) {
    return res.status(400).json({
      error: true,
      message: `Project ${project} is already running on port ${activeServers[project].port}`
    });
  }
  
  // Find available port
  const port = findAvailablePort(project);
  
  // Check if package.json exists
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return res.status(400).json({
      error: true,
      message: `Project ${project} does not have a package.json file`
    });
  }
  
  // Check if start script exists in package.json
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (!packageJson.scripts || !packageJson.scripts.start) {
      return res.status(400).json({
        error: true,
        message: `Project ${project} does not have a start script in package.json`
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: `Failed to read package.json: ${error.message}`
    });
  }
  
  // Start the project server
  console.log(`Starting project ${project} on port ${port}...`);
  
  const serverProcess = exec(`cd ${projectPath} && npm run start -- --port ${port}`, 
    (error) => {
      if (error) {
        delete activeServers[project];
        console.error(`Failed to start ${project}: ${error.message}`);
      }
    }
  );
  
  // Store server information
  activeServers[project] = {
    process: serverProcess,
    port,
    path: projectPath,
    startTime: Date.now()
  };
  
  // Set up proxy for this project
  app.use(`/${project}`, createProxyMiddleware({
    target: `http://localhost:${port}`,
    changeOrigin: true,
    pathRewrite: {
      [`^/${project}`]: ''
    },
    logLevel: 'silent'
  }));
  
  res.json({ 
    message: `Project ${project} started on port ${port}`,
    port,
    pid: serverProcess.pid
  });
});

// Stop a project server
app.post('/api/projects/:project/stop', (req, res) => {
  const { project } = req.params;
  
  if (!activeServers[project]) {
    return res.status(400).json(
      errorHandler.createErrorResponse('UNKNOWN_ERROR', {}, { 
        message: `Project ${project} is not running` 
      })
    );
  }
  
  // Kill the server process
  try {
    activeServers[project].process.kill();
    console.log(`Stopped project ${project}`);
    delete activeServers[project];
    
    res.json({ message: `Project ${project} stopped` });
  } catch (error) {
    res.status(500).json(
      errorHandler.createErrorResponse('INTERNAL_SERVER_ERROR', {}, { 
        details: `Failed to stop project: ${error.message}` 
      })
    );
  }
});

// Get project details
app.get('/api/projects/:project', (req, res) => {
  const { project } = req.params;
  const projectPath = path.join(__dirname, 'projects', project);
  
  if (!fs.existsSync(projectPath)) {
    return res.status(404).json(
      errorHandler.createErrorResponse('FILE_NOT_FOUND', { file: project })
    );
  }
  
  // Check if package.json exists
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return res.json({
      name: project,
      active: activeServers[project] ? true : false,
      port: activeServers[project]?.port || null,
      details: {
        path: projectPath
      }
    });
  }
  
  // Read package.json
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    res.json({
      name: project,
      active: activeServers[project] ? true : false,
      port: activeServers[project]?.port || null,
      uptime: activeServers[project]?.startTime 
        ? Math.floor((Date.now() - activeServers[project].startTime) / 1000) 
        : null,
      details: {
        version: packageJson.version,
        description: packageJson.description,
        author: packageJson.author,
        path: projectPath,
        dependencies: Object.keys(packageJson.dependencies || {}).length,
        devDependencies: Object.keys(packageJson.devDependencies || {}).length
      }
    });
  } catch (error) {
    res.json({
      name: project,
      active: activeServers[project] ? true : false,
      port: activeServers[project]?.port || null,
      details: {
        path: projectPath,
        error: 'Failed to read package.json'
      }
    });
  }
});

// ==============================================
// AUDIO PROCESSING API
// ==============================================

// Audio processing API endpoint
app.post('/api/process-audio', async (req, res) => {
  const { inputPath, outputPath, metadata } = req.body;
  
  if (!inputPath) {
    return res.status(400).json(
      errorHandler.createErrorResponse('UNKNOWN_ERROR', {}, { 
        message: 'Input path is required' 
      })
    );
  }
  
  try {
    // Check if file exists
    try {
      await fs.promises.access(inputPath);
    } catch (error) {
      return res.status(404).json(
        errorHandler.createErrorResponse('FILE_NOT_FOUND', { file: inputPath })
      );
    }
    
    // Process audio directly if queue system is not available
    if (!fs.existsSync(path.join(__dirname, 'lib', 'audioQueue.js'))) {
      console.log('Queue system not available, processing audio directly');
      const audioProcessor = require('./lib/audioProcessor');
      const result = await audioProcessor.processAudio(
        inputPath,
        outputPath || path.join(config.audioProcessor.outputDir, path.basename(inputPath)),
        metadata || {}
      );
      
      return res.json({ 
        success: true, 
        outputPath: result,
        message: 'Audio processed successfully'
      });
    }
    
    // Use queue if available
    try {
      const AudioProcessingQueue = require('./lib/audioQueue');
      const queue = new AudioProcessingQueue(config.queue);
      
      // Add job to queue
      const job = await queue.addJob({
        inputPath,
        outputPath: outputPath || path.join(config.audioProcessor.outputDir, path.basename(inputPath)),
        metadata: metadata || {}
      });
      
      res.json({ 
        success: true, 
        jobId: job.jobId,
        message: 'Audio processing job added to queue'
      });
    } catch (queueError) {
      console.error('Queue error, falling back to direct processing:', queueError.message);
      
      // Fallback to direct processing if queue fails
      const audioProcessor = require('./lib/audioProcessor');
      const result = await audioProcessor.processAudio(
        inputPath,
        outputPath || path.join(config.audioProcessor.outputDir, path.basename(inputPath)),
        metadata || {}
      );
      
      res.json({ 
        success: true, 
        outputPath: result,
        message: 'Audio processed successfully (direct mode)'
      });
    }
  } catch (error) {
    await errorHandler.logError(error, { inputPath, outputPath });
    res.status(500).json(
      errorHandler.createErrorResponse('FFMPEG_PROCESS_FAILED', {}, {
        details: error.message
      })
    );
  }
});

// Get audio processing job status
app.get('/api/process-audio/:jobId', async (req, res) => {
  const { jobId } = req.params;
  
  try {
    if (!fs.existsSync(path.join(__dirname, 'lib', 'audioQueue.js'))) {
      return res.status(404).json({
        error: true,
        message: 'Queue system not available'
      });
    }
    
    // Get queue
    const AudioProcessingQueue = require('./lib/audioQueue');
    const queue = new AudioProcessingQueue(config.queue);
    
    // Get job status
    const status = await queue.getJobStatus(jobId);
    
    res.json(status);
  } catch (error) {
    res.status(404).json(
      errorHandler.createErrorResponse('UNKNOWN_ERROR', {}, { 
        message: `Job ${jobId} not found or error retrieving status` 
      })
    );
  }
});

// Get all audio processing jobs
app.get('/api/process-audio', async (req, res) => {
  try {
    if (!fs.existsSync(path.join(__dirname, 'lib', 'audioQueue.js'))) {
      return res.json({
        waiting: [],
        active: [],
        completed: [],
        failed: [],
        counts: {
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
          total: 0
        },
        message: 'Queue system not available'
      });
    }
    
    // Get queue
    const AudioProcessingQueue = require('./lib/audioQueue');
    const queue = new AudioProcessingQueue(config.queue);
    
    // Get all jobs
    const jobs = await queue.getAllJobs();
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json(
      errorHandler.createErrorResponse('INTERNAL_SERVER_ERROR', {}, { 
        details: error.message 
      })
    );
  }
});

// FFmpeg status check endpoint
app.get('/api/ffmpeg-status', async (req, res) => {
  try {
    const audioProcessor = require('./lib/audioProcessor');
    const isWorking = await audioProcessor.validateFFmpegInstallation();
    
    // Get FFmpeg version
    const getFFmpegVersion = async () => {
      return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', ['-version']);
        let output = '';
        
        ffmpeg.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        ffmpeg.on('close', (code) => {
          if (code === 0) {
            const versionMatch = output.match(/ffmpeg version ([0-9.]+)/);
            resolve(versionMatch ? versionMatch[1] : 'Unknown');
          } else {
            resolve('Not available');
          }
        });
        
        ffmpeg.on('error', () => {
          resolve('Not available');
        });
      });
    };
    
    res.json({ 
      installed: isWorking,
      version: isWorking ? await getFFmpegVersion() : null
    });
  } catch (error) {
    res.status(500).json(
      errorHandler.createErrorResponse('INTERNAL_SERVER_ERROR', {}, { 
        details: error.message 
      })
    );
  }
});

// ==============================================
// METADATA EXTRACTION API
// ==============================================

// Extract metadata from file
app.post('/api/extract-metadata', async (req, res) => {
  const { filePath } = req.body;
  
  if (!filePath) {
    return res.status(400).json(
      errorHandler.createErrorResponse('UNKNOWN_ERROR', {}, { 
        message: 'File path is required' 
      })
    );
  }
  
  try {
    // Check if file exists
    try {
      await fs.promises.access(filePath);
    } catch (error) {
      return res.status(404).json(
        errorHandler.createErrorResponse('FILE_NOT_FOUND', { file: filePath })
      );
    }
    
    // Check if metadataExtractor exists
    if (!fs.existsSync(path.join(__dirname, 'lib', 'metadataExtractor.js'))) {
      // Fallback to using audio processor for extraction
      const audioProcessor = require('./lib/audioProcessor');
      const metadata = await audioProcessor.extractMetadata(filePath);
      
      return res.json({
        success: true,
        metadata
      });
    }
    
    const metadataExtractor = require('./lib/metadataExtractor');
    const metadata = await metadataExtractor.extractFromFile(filePath);
    
    res.json({
      success: true,
      metadata
    });
  } catch (error) {
    res.status(500).json(
      errorHandler.createErrorResponse('METADATA_EXTRACTION_FAILED', {}, { 
        details: error.message 
      })
    );
  }
});

// ==============================================
// HEALTH AND SYSTEM ENDPOINTS
// ==============================================

// Health check endpoint for API
app.get('/api/health', (req, res) => {
  // Check system health
  const health = {
    status: 'ok',
    environment: ENV,
    uptime: process.uptime(),
    timestamp: Date.now(),
    memory: process.memoryUsage(),
    activeProjects: Object.keys(activeServers).length
  };
  
  res.json(health);
});

// System information
app.get('/api/system', (req, res) => {
  const os = require('os');
  
  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptime: os.uptime(),
    loadAvg: os.loadavg(),
    nodeVersion: process.version,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// ==============================================
// WEB DASHBOARD
// ==============================================

// Function to find an available port
function findAvailablePort(project) {
  // Assign specific ports to known projects or find an available one
  if (project === 'da1-mvp') return config.projects['da1-mvp']?.port || 3000;
  if (project === 'da1.fm') return config.projects['da1.fm']?.port || 3001;
  if (project === 'da1-mvp-02') return config.projects['da1-mvp-02']?.port || 3002;
  
  // Check if port is configured for this project
  if (config.projects && config.projects[project] && config.projects[project].port) {
    return config.projects[project].port;
  }
  
  // Find a port not in use by other projects
  let port = 3010; // Start from a safe range
  while (Object.values(activeServers).some(server => server.port === port)) {
    port++;
  }
  return port;
}

// Default route to master dashboard
app.get('/', (req, res) => {
  // Check if dashboard exists
  if (fs.existsSync(path.join(__dirname, 'public', 'dashboard.html'))) {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
  } else {
    res.send(`
      <html>
        <head>
          <title>DA1 Development Server</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #2c5364; }
            .project { margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
            .active { background-color: #d4edda; }
            .inactive { background-color: #f8f9fa; }
          </style>
        </head>
        <body>
          <h1>DA1 Development Server</h1>
          <p>The master server is running on port ${PORT}.</p>
          <h2>Projects</h2>
          <div id="projects">Loading projects...</div>
          
          <script>
            fetch('/api/projects')
              .then(response => response.json())
              .then(projects => {
                const projectsContainer = document.getElementById('projects');
                projectsContainer.innerHTML = '';
                
                if (projects.length === 0) {
                  projectsContainer.innerHTML = '<p>No projects found.</p>';
                  return;
                }
                
                projects.forEach(project => {
                  const projectElement = document.createElement('div');
                  projectElement.className = 'project ' + (project.active ? 'active' : 'inactive');
                  
                  projectElement.innerHTML = \`
                    <h3>\${project.name}</h3>
                    <p>Status: \${project.active ? 'Running' : 'Stopped'}</p>
                    \${project.port ? \`<p>Port: \${project.port}</p>\` : ''}
                    \${project.active ? \`<a href="http://localhost:\${project.port}" target="_blank">Open project</a>\` : ''}
                  \`;
                  
                  projectsContainer.appendChild(projectElement);
                });
              })
              .catch(error => {
                document.getElementById('projects').innerHTML = '<p>Error loading projects: ' + error.message + '</p>';
              });
          </script>
        </body>
      </html>
    `);
  }
});

// Serve static dashboard assets
app.use(express.static(path.join(__dirname, 'public')));

// Register error handler middleware
if (typeof errorHandler.registerWithExpress === 'function') {
  errorHandler.registerWithExpress(app);
} else {
  // Fallback error handler
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
      error: true,
      message: err.message || 'Internal server error'
    });
  });
}

// Start the master server
app.listen(PORT, () => {
  console.log(`🚀 DA1 Master Server running on http://localhost:${PORT}`);
  console.log(`📂 Managing projects from ${path.join(__dirname, 'projects')}`);
  
  // Check if API docs are available
  if (fs.existsSync(path.join(__dirname, 'config', 'swagger.json'))) {
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down all project servers...');
  
  // Stop all active servers
  Object.entries(activeServers).forEach(([project, server]) => {
    try {
      server.process.kill();
      console.log(`✓ ${project} stopped`);
    } catch (error) {
      console.error(`Failed to stop ${project}: ${error.message}`);
    }
  });
  
  console.log('👋 Master server shutdown complete');
  process.exit(0);
});
