/**
 * DA1 Outreach Post Generator
 * 
 * This script generates outreach post HTML files from the contacts-03.html file.
 * It extracts information about each contact and creates a standardized outreach post.
 */

// Import required modules
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Paths
const CONTACTS_FILE = path.join(__dirname, 'contacts-03.html');
const TEMPLATE_FILE = path.join(__dirname, 'outreach-template.html');
const OUTPUT_DIR = path.join(__dirname, 'posts');
const POSTS_LIST = path.join(__dirname, 'outreach-posts.txt');

// Load files
const contactsHtml = fs.readFileSync(CONTACTS_FILE, 'utf8');
const templateHtml = fs.readFileSync(TEMPLATE_FILE, 'utf8');

// Parse contacts file
const contactsDom = new JSDOM(contactsHtml);
const document = contactsDom.window.document;
const contactElements = document.querySelectorAll('.contact');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

// Initialize posts list array
let generatedPosts = [];
if (fs.existsSync(POSTS_LIST)) {
  generatedPosts = fs.readFileSync(POSTS_LIST, 'utf8').split('\n').filter(Boolean);
}

// Function to create filename from name
function createFilename(name) {
  return name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
}

// Function to format date
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Process each contact
contactElements.forEach(contact => {
  // Only process contacts with "Ready for Outreach" status
  const statusElement = contact.querySelector('.status');
  if (!statusElement || !statusElement.classList.contains('status-ready')) {
    return;
  }

  // Extract contact information
  const id = contact.id;
  const name = contact.querySelector('h3').textContent.trim();
  const role = contact.querySelector('p strong:first-child').nextSibling.textContent.trim();
  const socialElement = contact.querySelector('.social-handle');
  const social = socialElement ? socialElement.textContent.trim().split(': ')[1] : '';
  const categoryElement = contact.querySelector('.category');
  const category = categoryElement ? categoryElement.textContent.trim() : 'Other';
  
  // Get background
  const backgroundElement = contact.querySelector('.background p');
  const background = backgroundElement ? backgroundElement.textContent.trim() : '';
  
  // Get quote
  const quoteElement = contact.querySelector('.quote');
  let quote = '';
  let quoteSource = '';
  if (quoteElement) {
    quote = quoteElement.childNodes[0].textContent.trim();
    const sourceElement = quoteElement.querySelector('.quote-source');
    quoteSource = sourceElement ? sourceElement.textContent.replace('Source: ', '').trim() : '';
  }
  
  // Get tweets
  const verificationTweetElement = contact.querySelector('.verification-tweet p');
  const verificationTweet = verificationTweetElement ? verificationTweetElement.textContent.trim() : '';
  
  const invitationTweetElement = contact.querySelector('.invitation-tweet p');
  const invitationTweet = invitationTweetElement ? invitationTweetElement.textContent.trim() : '';
  
  // Generate personalized message
  const personalizedMessageP1 = `Dear ${name.split(' ')[0]}, I came across your insights about metadata challenges in the ${category.toLowerCase()} industry. Your statement that "${quote.replace(/"/g, '')}" resonated deeply with our team at DA1.`;
  
  const personalizedMessageP2 = `At DA1, we're developing a universal metadata solution that preserves attribution across platforms and prevents the stripping of creator information. Our approach uses blockchain technology to create a persistent layer of attribution that remains connected to creative works regardless of how they're shared or transformed. We'd love to discuss how our work might align with your perspective on these critical issues.`;
  
  // Create filename
  const filename = createFilename(name);
  const filePath = path.join(OUTPUT_DIR, `${filename}.html`);
  
  // Current date
  const today = new Date();
  const publishDate = today.toISOString().split('T')[0];
  const displayDate = formatDate(today);
  
  // Create post content from template
  let postContent = templateHtml;
  postContent = postContent.replace(/data-publish-status="draft"/g, 'data-publish-status="published"');
  postContent = postContent.replace(/data-tweet-status="pending"/g, 'data-tweet-status="ready"');
  postContent = postContent.replace(/\[TARGET_NAME\]/g, name);
  postContent = postContent.replace(/\[TARGET_ROLE\]/g, role);
  postContent = postContent.replace(/\[TARGET_TWITTER\]/g, social);
  postContent = postContent.replace(/\[PUBLISH_DATE\]/g, publishDate);
  postContent = postContent.replace(/\[DISPLAY_DATE\]/g, displayDate);
  postContent = postContent.replace(/\[CATEGORY\]/g, category);
  postContent = postContent.replace(/\[TAGS\]/g, `${category.toLowerCase()}, metadata, attribution, creator rights`);
  postContent = postContent.replace(/\[POST_FILENAME\]/g, filename);
  postContent = postContent.replace(/\[TARGET_BACKGROUND\]/g, background);
  postContent = postContent.replace(/\[TARGET_QUOTE\]/g, quote.replace(/"/g, ''));
  postContent = postContent.replace(/\[PERSONALIZED_MESSAGE_PARAGRAPH_1\]/g, personalizedMessageP1);
  postContent = postContent.replace(/\[PERSONALIZED_MESSAGE_PARAGRAPH_2\]/g, personalizedMessageP2);
  
  // Update tweet sections
  postContent = postContent.replace(
    /<div class="tweet-content">([\s\S]*?)<\/div>/,
    `<div class="tweet-content">
        <h2>Tweet 1: Verification Tweet</h2>
        <p data-tweet-text="${verificationTweet}">${verificationTweet}</p>
        <div class="tweet-status pending">Pending</div>
    </div>
    
    <div class="tweet-content">
        <h2>Tweet 2: Invitation Tweet</h2>
        <p data-tweet-text="${invitationTweet}">${invitationTweet}</p>
        <div class="tweet-status pending">Pending</div>
    </div>`
  );
  
  // Write the file
  fs.writeFileSync(filePath, postContent);
  console.log(`Generated outreach post for ${name} at ${filePath}`);
  
  // Add to posts list if not already there
  if (!generatedPosts.includes(`${filename}.html`)) {
    generatedPosts.push(`${filename}.html`);
  }
});

// Update posts list file
fs.writeFileSync(POSTS_LIST, generatedPosts.join('\n'));
console.log(`Updated outreach posts list with ${generatedPosts.length} entries.`);

console.log('Outreach post generation complete!');