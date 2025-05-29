#!/usr/bin/env node
/**
 * DA1 Outreach Post Generator (Improved)
 * 
 * This script reads contact information and generates outreach posts for each contact.
 * It creates HTML files in the outreach/posts directory and updates the outreach-posts.txt file.
 * 
 * Improvements:
 * - Properly handles quotes
 * - Fixes HTML issues
 * - Ensures data-publish-status is set to "published"
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Configuration
const CONTACTS_FILE = path.join(__dirname, '../internal/contacts-01-expanded.html');
const OUTREACH_TEMPLATE = path.join(__dirname, 'outreach-template.html');
const POSTS_DIR = path.join(__dirname, 'posts');
const OUTREACH_POSTS_FILE = path.join(__dirname, 'outreach-posts.txt');

// Make sure posts directory exists
if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}

// Read the contacts file
let contactsHtml;
try {
  contactsHtml = fs.readFileSync(CONTACTS_FILE, 'utf8');
} catch (error) {
  console.error(`Error reading contacts file: ${error.message}`);
  process.exit(1);
}

// Parse the contacts file
const $ = cheerio.load(contactsHtml);

// Read the template file
let templateHtml;
try {
  templateHtml = fs.readFileSync(OUTREACH_TEMPLATE, 'utf8');
} catch (error) {
  console.error(`Error reading template file: ${error.message}`);
  process.exit(1);
}

// Read the current outreach-posts.txt file
let existingPosts = [];
try {
  const postsText = fs.readFileSync(OUTREACH_POSTS_FILE, 'utf8');
  existingPosts = postsText.split('\n').filter(line => line.trim() !== '');
} catch (error) {
  console.warn(`Warning: Could not read outreach-posts.txt. A new file will be created.`);
}

// Extract contacts information
const contacts = [];
$('.person').each((index, element) => {
  const name = $(element).find('h3').text().replace(/^[0-9]+/, '').trim();
  const role = $(element).find('.role').text().trim();
  
  // Extract quote - some contacts might not have quotes
  let quote = '';
  const quoteElement = $(element).find('.quote');
  if (quoteElement.length > 0) {
    quote = quoteElement.text().trim();
    // Remove surrounding quotes if they exist
    if (quote.startsWith('"') && quote.endsWith('"')) {
      quote = quote.substring(1, quote.length - 1);
    }
  }
  
  // Extract background
  let background = '';
  const notesElement = $(element).find('.notes');
  if (notesElement.length > 0) {
    background = notesElement.text().trim();
  }
  
  // Extract Twitter handle
  let twitter = '';
  $(element).find('.contact-info a').each((i, link) => {
    const href = $(link).attr('href');
    if (href && href.includes('twitter.com')) {
      twitter = '@' + href.split('twitter.com/')[1];
    }
  });
  
  // Create a filename for the post
  const filename = name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') + '.html';
  
  contacts.push({
    name,
    role,
    quote,
    background,
    twitter,
    filename
  });
});

console.log(`Found ${contacts.length} contacts in the file.`);

// Generate an outreach post for each contact
let newPostsCount = 0;
let skippedCount = 0;
let errorCount = 0;
let allPostFilenames = [...existingPosts];

for (const contact of contacts) {
  // Skip if a post with this filename already exists in the existing posts list
  if (existingPosts.includes(contact.filename)) {
    console.log(`Skipping ${contact.name} (post already exists in list)`);
    skippedCount++;
    continue;
  }
  
  // Skip if the file already exists but isn't in the list (avoid duplicates)
  if (fs.existsSync(path.join(POSTS_DIR, contact.filename))) {
    console.log(`Skipping ${contact.name} (file exists on disk)`);
    
    // Make sure it's in our list though
    if (!allPostFilenames.includes(contact.filename)) {
      allPostFilenames.push(contact.filename);
    }
    
    skippedCount++;
    continue;
  }
  
  // Skip if the contact doesn't have a quote or twitter handle
  if (!contact.quote || !contact.twitter) {
    console.log(`Skipping ${contact.name} (missing quote or Twitter handle)`);
    skippedCount++;
    continue;
  }
  
  try {
    // Prepare the outreach post HTML
    let postHtml = templateHtml;
    
    // Make sure the post is published
    postHtml = postHtml.replace('data-publish-status="draft"', 'data-publish-status="published"');
    
    // Generate a random date between April 15 and May 8, 2025
    const randomDate = new Date(2025, 3, 15 + Math.floor(Math.random() * 24));
    const publishDateIso = randomDate.toISOString();
    const displayDate = randomDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Assign a category based on the contact's role
    let category = 'Industry';
    if (contact.role.toLowerCase().includes('music') || contact.role.toLowerCase().includes('artist')) {
      category = 'Music';
    } else if (contact.role.toLowerCase().includes('tech') || contact.role.toLowerCase().includes('blockchain')) {
      category = 'Technology';
    } else if (contact.role.toLowerCase().includes('photo') || contact.role.toLowerCase().includes('film')) {
      category = 'Visual Media';
    } else if (contact.role.toLowerCase().includes('professor') || contact.role.toLowerCase().includes('research')) {
      category = 'Academia';
    } else if (contact.role.toLowerCase().includes('investor') || contact.role.toLowerCase().includes('fund')) {
      category = 'Investment';
    }
    
    // Generate tags based on role and category
    const roleParts = contact.role.toLowerCase().split(/\s+/);
    const tagSet = new Set([category]);
    
    ['blockchain', 'nft', 'web3', 'rights', 'metadata', 'attribution', 'creator', 'music', 'art', 'photo', 'video']
      .forEach(keyword => {
        if (contact.role.toLowerCase().includes(keyword) || contact.quote.toLowerCase().includes(keyword)) {
          tagSet.add(keyword.charAt(0).toUpperCase() + keyword.slice(1));
        }
      });
    
    const tags = Array.from(tagSet);
    
    // Replace template placeholders
    postHtml = postHtml
      .replace(/\[TARGET_NAME\]/g, contact.name)
      .replace(/\[TARGET_ROLE\]/g, contact.role)
      .replace(/\[TARGET_TWITTER\]/g, contact.twitter)
      .replace(/\[TARGET_QUOTE\]/g, contact.quote)
      .replace(/\[TARGET_BACKGROUND\]/g, contact.background || 'A leader in their field with valuable insights on creator rights and attribution.')
      .replace(/\[PUBLISH_DATE\]/g, publishDateIso)
      .replace(/\[DISPLAY_DATE\]/g, displayDate)
      .replace(/\[CATEGORY\]/g, category)
      .replace(/\[TAGS\]/g, tags.join(','))
      .replace(/\[POST_FILENAME\]/g, contact.filename)
      .replace(/\.html\.html/g, '.html'); // Fix double extension in og:url
    
    // Generate personalized message based on the quote and role
    const firstName = contact.name.split(' ')[0];
    let personalizedMessage1 = `Dear ${firstName}, your work in the ${category.toLowerCase()} space has been inspirational to us at DA1. Your insights about "${contact.quote.substring(0, 50)}..." resonate deeply with our mission.`;
    let personalizedMessage2 = `At DA1, we've developed a metaMetadata system that ensures attribution data persists throughout the entire digital journey of creative work. Our approach creates a persistent layer of attribution that survives when content travels across platforms that typically strip this data. Given your unique perspective, we believe your insights on our solution would be incredibly valuable.`;
    
    postHtml = postHtml
      .replace(/\[PERSONALIZED_MESSAGE_PARAGRAPH_1\]/g, personalizedMessage1)
      .replace(/\[PERSONALIZED_MESSAGE_PARAGRAPH_2\]/g, personalizedMessage2);
    
    // Generate tweet text
    const verificationTweet = `${contact.twitter} Hi ${firstName}, did you really say: '${contact.quote}'? Wanted to check...great quote btw...the DA1 team`;
    const invitationTweet = `${contact.twitter} Your work in the field of ${category.toLowerCase()} continues to inspire. We're inviting you to ask 'Dawon', our chatbot, anything about DA1metaMetaData here: https://da1.fm/chat.html`;
    
    // Update tweet structure
    postHtml = postHtml.replace(/<h2>Prepared Tweet<\/h2>[\s\S]*?<\/div>/m, `
        <h2>Tweet 1: Verification Tweet</h2>
        <p data-tweet-text="${verificationTweet}">${verificationTweet}</p>
        <div class="tweet-status pending">Pending</div>
    </div>
    
    <!-- Tweet 2: Invitation Tweet -->
    <div class="tweet-content">
        <h2>Tweet 2: Invitation Tweet</h2>
        <p data-tweet-text="${invitationTweet}">${invitationTweet}</p>`);
    
    // Update follow-up plan
    postHtml = postHtml.replace(/<h2>Follow-up Plan<\/h2>[\s\S]*?<\/div>/m, `
        <h2>Outreach Plan</h2>
        <ol>
            <li>Check if quote is correct</li>
            <li>Monitor for response</li>
            <li>Thank for excellent work</li>
            <li>Send invitation code to chat</li>
            <li>Collaborate, cooperate, and solve the global metadata crisis — together!</li>
        </ol>
    </div>`);
    
    // Write the post file
    const postPath = path.join(POSTS_DIR, contact.filename);
    fs.writeFileSync(postPath, postHtml);
    console.log(`✓ Created outreach post for ${contact.name} at ${contact.filename}`);
    newPostsCount++;
    
    // Add to the list of posts for outreach-posts.txt
    if (!allPostFilenames.includes(contact.filename)) {
      allPostFilenames.push(contact.filename);
    }
    
  } catch (error) {
    console.error(`Error creating post for ${contact.name}: ${error.message}`);
    errorCount++;
  }
}

// Update the outreach-posts.txt file with all post filenames
fs.writeFileSync(OUTREACH_POSTS_FILE, allPostFilenames.join('\n') + '\n');

console.log('\nOutreach Post Generation Complete:');
console.log(`- ${newPostsCount} new posts created`);
console.log(`- ${skippedCount} posts skipped (already exist or missing data)`);
console.log(`- ${errorCount} errors encountered`);
console.log(`- ${allPostFilenames.length} total posts in outreach-posts.txt`);

console.log('\nDone! Visit your outreach page to see all posts.');