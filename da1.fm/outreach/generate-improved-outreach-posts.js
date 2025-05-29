// Script to generate outreach posts with improved, varied language
// Uses the improved template generator instead of repetitive phrasing

const fs = require('fs');
const path = require('path');
const { generateImprovedOutreachMessage } = require('./improved-template-generator');

// File paths
const contactsPath = path.join(__dirname, 'outreach-posts.txt');
const templatePath = path.join(__dirname, 'outreach-template.html');
const outputDir = path.join(__dirname, 'posts');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Read the template and contacts data
const templateContent = fs.readFileSync(templatePath, 'utf8');
const contactsData = fs.readFileSync(contactsPath, 'utf8');

// Parse the contacts data
const contacts = parseContactsData(contactsData);

// Generate files for each contact
generateOutreachFiles(contacts, templateContent);

/**
 * Parses contact data from the outreach-posts.txt file
 * @param {string} data - The raw contact data
 * @returns {Array} - Array of contact objects
 */
function parseContactsData(data) {
  const lines = data.split('\n');
  const contacts = [];
  let currentContact = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('Name:')) {
      // If we have a previous contact, save it
      if (currentContact.name) {
        contacts.push(currentContact);
      }
      
      // Start a new contact
      currentContact = {
        name: line.substring(5).trim()
      };
    } else if (line.startsWith('Twitter:')) {
      currentContact.twitterHandle = line.substring(8).trim();
    } else if (line.startsWith('Field:')) {
      currentContact.field = line.substring(6).trim();
    } else if (line.startsWith('Role:')) {
      currentContact.role = line.substring(5).trim();
    } else if (line.startsWith('Background:')) {
      currentContact.background = line.substring(11).trim();
    } else if (line.startsWith('Quote:')) {
      currentContact.quote = line.substring(6).trim();
    } else if (line.startsWith('Date:')) {
      currentContact.date = line.substring(5).trim();
    } else if (line.startsWith('Tags:')) {
      const tagsStr = line.substring(5).trim();
      currentContact.tags = tagsStr.split(',').map(tag => tag.trim());
    }
  }
  
  // Add the last contact
  if (currentContact.name) {
    contacts.push(currentContact);
  }
  
  return contacts;
}

/**
 * Generates HTML files for each contact using the improved message generator
 * @param {Array} contacts - Array of contact objects
 * @param {string} template - The HTML template content
 */
function generateOutreachFiles(contacts, template) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  contacts.forEach(contact => {
    // Skip if essential data is missing
    if (!contact.name || !contact.field || !contact.quote) {
      console.log(`Skipping ${contact.name || 'unnamed contact'} due to missing information`);
      return;
    }
    
    // Provide default values for missing fields
    if (!contact.twitterHandle) {
      contact.twitterHandle = contact.name.toLowerCase().replace(/\s+/g, '');
      if (!contact.twitterHandle.startsWith('@')) {
        contact.twitterHandle = '@' + contact.twitterHandle;
      }
    }
    
    if (!contact.role) {
      contact.role = `Prominent figure in ${contact.field}`;
    }
    
    if (!contact.background) {
      contact.background = `${contact.name} is known for their significant contributions to the ${contact.field} industry.`;
    }
    
    if (!contact.date) {
      // Default to current date
      const date = new Date();
      contact.date = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
    
    // Generate improved messages
    const messages = generateImprovedOutreachMessage(contact);
    
    // Format display date
    const dateParts = contact.date.split('-');
    const displayDate = `${monthNames[parseInt(dateParts[1]) - 1]} ${parseInt(dateParts[2])}, ${dateParts[0]}`;
    
    // Prepare filename
    const filename = contact.name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      + '.html';
    
    // Tags formatting
    const tagsStr = contact.tags ? contact.tags.join(', ') : contact.field;
    
    // Replace template placeholders
    let output = template
      .replace(/\[TARGET_NAME\]/g, contact.name)
      .replace(/\[TARGET_ROLE\]/g, contact.role)
      .replace(/\[TARGET_TWITTER\]/g, contact.twitterHandle)
      .replace(/\[TARGET_BACKGROUND\]/g, contact.background)
      .replace(/\[TARGET_QUOTE\]/g, contact.quote)
      .replace(/\[PERSONALIZED_MESSAGE_PARAGRAPH_1\]/g, messages.paragraph1)
      .replace(/\[PERSONALIZED_MESSAGE_PARAGRAPH_2\]/g, messages.paragraph2)
      .replace(/\[TWEET_TEXT\]/g, messages.tweet)
      .replace(/\[CATEGORY\]/g, contact.field)
      .replace(/\[TAGS\]/g, tagsStr)
      .replace(/\[PUBLISH_DATE\]/g, contact.date)
      .replace(/\[DISPLAY_DATE\]/g, displayDate)
      .replace(/\[POST_FILENAME\]/g, filename.replace('.html', ''));
    
    // Write the file
    const outputPath = path.join(outputDir, filename);
    fs.writeFileSync(outputPath, output, 'utf8');
    console.log(`Generated: ${outputPath}`);
  });
  
  console.log(`Generated ${contacts.length} outreach files with improved messaging.`);
}