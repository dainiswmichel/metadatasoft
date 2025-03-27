const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const da1Routes = require('./routes/da1_routes.js');

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3000;
const basePath = __dirname; // Full base directory of project

// Middleware to support JSON, form data, and CORS
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure necessary directories exist
const requiredDirs = [
  path.join(basePath, 'logs'),
  path.join(basePath, 'output'),
  path.join(basePath, 'uploads')
];

requiredDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created missing directory: ${dir}`);
  }
});

// Static file serving for resources, frontend, and outputs
app.use('/resources', express.static(path.join(basePath, 'resources')));
app.use('/output', express.static(path.join(basePath, 'output')));
app.use('/kb', express.static(path.join(basePath, 'kb')));
app.use('/', express.static(basePath));

// Register routes defined in routes/da1_routes.js
app.use('/', da1Routes);

// Start the server
app.listen(PORT, () => {
  console.log('==========================================');
  console.log(`✅ Dainisne Master Server is running: http://localhost:${PORT}`);
  console.log(`✅ Environment: development`);
  console.log(`✅ Base Path: ${basePath}`);
  console.log('==========================================');
  console.log('✅ Static files served:');
  console.log(` - Resources: /resources --> ${path.join(basePath, 'resources')}`);
  console.log(` - Output: /output --> ${path.join(basePath, 'output')}`);
  console.log(` - KB: /kb --> ${path.join(basePath, 'kb')}`);
  console.log(` - Frontend Root: / --> ${basePath}`);
});
