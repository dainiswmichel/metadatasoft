// Script to generate 50 outreach HTML files from template-generator.js
// This script will:
// 1. Generate HTML files for 50 contacts
// 2. Save them to the posts/ directory
// 3. Update outreach-posts.txt with the new filenames

const fs = require('fs');
const path = require('path');

// Import the template generator module
const templateGenerator = require('./template-generator.js');

// Get the contacts and functions from the module
const { contacts, generateOutreachHTML, generateFiles } = templateGenerator;

// Generate files
async function generateAllFiles() {
  // First, create the posts directory if it doesn't exist
  const postsDir = path.join(__dirname, 'posts');
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir);
  }
  
  // Generate the files data (create our own implementation since we can't directly access the one in the template)
  const outputs = [];
  const fileNames = [];
  
  // Generate dates - 2 per day from May 5 through May 31
  for (let i = 0; i < contacts.length; i++) {
    // Calculate day offset (0, 0, 1, 1, 2, 2, etc.)
    const dayOffset = Math.floor(i / 2);
    
    // Create date object for May 5 + dayOffset
    const date = new Date(2025, 4, 5 + dayOffset);
    
    // Format ISO date for metadata (T21:00:00.000Z matches existing pattern)
    const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T21:00:00.000Z`;
    
    // Format display date (e.g., "May 5, 2025")
    const displayDate = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Generate HTML
    const html = generateOutreachHTML(contacts[i], isoDate, displayDate);
    
    // Create filename
    const fileName = contacts[i].name.toLowerCase().replace(/[^\w]/g, '-').replace(/--+/g, '-') + '.html';
    
    // Add to outputs
    outputs.push({
      fileName,
      html
    });
    
    // Add to list of filenames
    fileNames.push(fileName);
  }
  
  // Write each file
  for (const output of outputs) {
    const filePath = path.join(postsDir, output.fileName);
    fs.writeFileSync(filePath, output.html, 'utf8');
    console.log(`Generated: ${output.fileName}`);
  }
  
  // Update outreach-posts.txt
  const outreachPostsPath = path.join(__dirname, 'outreach-posts.txt');
  let existingContent = '';
  
  if (fs.existsSync(outreachPostsPath)) {
    existingContent = fs.readFileSync(outreachPostsPath, 'utf8');
  }
  
  // Add new filenames
  const newContent = existingContent + '\n' + fileNames.join('\n');
  
  // Write updated content
  fs.writeFileSync(outreachPostsPath, newContent, 'utf8');
  
  console.log(`Updated outreach-posts.txt with ${fileNames.length} new files`);
  console.log('Done!');
}

// Execute the generation
generateAllFiles().catch(err => {
  console.error('Error generating files:', err);
});