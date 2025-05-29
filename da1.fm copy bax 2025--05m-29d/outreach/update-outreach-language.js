// Script to update existing outreach posts with improved, varied language
// Replaces repetitive phrases with more professional, varied language

const fs = require('fs');
const path = require('path');
const { generateImprovedOutreachMessage } = require('./improved-template-generator');

// Directory containing the outreach posts
const postsDir = path.join(__dirname, 'posts');

// Process all HTML files in the posts directory
updateOutreachFiles();

/**
 * Updates all outreach files with improved language
 */
function updateOutreachFiles() {
  // Get all HTML files in the posts directory
  const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.html'));
  
  console.log(`Found ${files.length} outreach files to update`);
  
  let updatedCount = 0;
  
  // Process each file
  files.forEach(filename => {
    const filePath = path.join(postsDir, filename);
    
    try {
      // Read the file content
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract the contact information from the file
      const contactData = extractContactData(content, filename);
      
      // Skip if we couldn't extract enough data
      if (!contactData.name || !contactData.field || !contactData.quote) {
        console.log(`Skipping ${filename}: Insufficient data extracted`);
        return;
      }
      
      // Generate improved messages
      const messages = generateImprovedOutreachMessage(contactData);
      
      // Update the file content
      const updatedContent = updateFileContent(content, messages);
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      
      updatedCount++;
      console.log(`Updated: ${filename}`);
    } catch (error) {
      console.error(`Error processing ${filename}: ${error.message}`);
    }
  });
  
  console.log(`Updated ${updatedCount} outreach files with improved language.`);
}

/**
 * Extracts contact information from an outreach file
 * @param {string} content - The HTML content of the file
 * @param {string} filename - The filename (used to extract name if needed)
 * @returns {Object} - The extracted contact data
 */
function extractContactData(content, filename) {
  const data = {
    // Default field to "industry" if we can't extract it
    field: "industry"
  };
  
  // Extract name from h1 title
  const nameMatch = content.match(/<h1>Outreach to ([^<]+)<\/h1>/);
  if (nameMatch && nameMatch[1]) {
    data.name = nameMatch[1].trim();
  } else {
    // Try to extract from filename
    data.name = filename
      .replace('.html', '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Extract Twitter handle
  const twitterMatch = content.match(/<i class="bi bi-twitter"><\/i> (@[^<]+)<\/span>/);
  if (twitterMatch && twitterMatch[1]) {
    data.twitterHandle = twitterMatch[1].trim();
  } else {
    data.twitterHandle = '@' + data.name.toLowerCase().replace(/\s+/g, '');
  }
  
  // Extract field/category
  const categoryMatch = content.match(/<div class="category-tag">([^<]+)<\/div>/);
  if (categoryMatch && categoryMatch[1]) {
    data.field = categoryMatch[1].trim();
  }
  
  // Extract quote
  const quoteMatch = content.match(/<blockquote class="target-quote">"([^"]+)"<\/blockquote>/);
  if (quoteMatch && quoteMatch[1]) {
    data.quote = quoteMatch[1].trim();
  } else {
    // Try to find any quoted text in the personalized message
    const messageQuoteMatch = content.match(/Your insights about "([^"]+)"/);
    if (messageQuoteMatch && messageQuoteMatch[1]) {
      data.quote = messageQuoteMatch[1].trim();
    } else {
      // Default quote if we can't find one
      data.quote = `The future of attribution is critical for creators in the ${data.field} industry.`;
    }
  }
  
  return data;
}

/**
 * Updates the file content with improved messages
 * @param {string} content - The original HTML content
 * @param {Object} messages - The improved messages
 * @returns {string} - The updated HTML content
 */
function updateFileContent(content, messages) {
  // Replace the personalized message paragraphs
  let updatedContent = content;
  
  // Find and replace the first paragraph that starts with "Dear"
  const messageRegex = /<p>Dear [^<]+<\/p>/;
  if (messageRegex.test(updatedContent)) {
    updatedContent = updatedContent.replace(messageRegex, `<p>${messages.paragraph1}</p>`);
  }
  
  // Find and replace the second paragraph that starts with "At DA1"
  const secondParagraphRegex = /<p>At DA1[^<]+<\/p>/;
  if (secondParagraphRegex.test(updatedContent)) {
    updatedContent = updatedContent.replace(secondParagraphRegex, `<p>${messages.paragraph2}</p>`);
  }
  
  // Update the tweet if it exists
  const tweetRegex = /<p data-tweet-text="[^>]+>([^<]+)<\/p>/;
  if (tweetRegex.test(updatedContent)) {
    updatedContent = updatedContent.replace(tweetRegex, `<p data-tweet-text="${messages.tweet}">${messages.tweet}</p>`);
  }
  
  return updatedContent;
}