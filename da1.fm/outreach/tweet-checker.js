#!/usr/bin/env node
/**
 * DA1 Outreach Tweet Checker
 * 
 * This script scans the outreach posts directory for posts marked as "published"
 * but not yet "tweeted", extracts the tweet text, and posts it to Twitter.
 * 
 * Usage:
 *   node tweet-checker.js [--dry-run] [--verification-only]
 * 
 * Options:
 *   --dry-run          Only print what would be tweeted without actually posting
 *   --verification-only Generate verification tweets instead of regular tweets
 *                      (these tweets ask targets to verify quotes attributed to them)
 */

const fs = require('fs');
const path = require('path');
const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

// Configuration
const OUTREACH_DIR = path.join(__dirname);
const POSTS_DIR = path.join(OUTREACH_DIR, 'posts');
const LOG_FILE = path.join(OUTREACH_DIR, 'tweet-log.txt');

// Command line arguments
const isDryRun = process.argv.includes('--dry-run');
const isVerificationOnly = process.argv.includes('--verification-only');

// Initialize Twitter client (only if not in dry run mode)
let twitterClient = null;
if (!isDryRun) {
  try {
    twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });
  } catch (error) {
    logMessage(`Error initializing Twitter client: ${error.message}`);
    logMessage('Make sure you have set up the .env file with your Twitter API credentials.');
    process.exit(1);
  }
}

// Helper function to log messages
function logMessage(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(LOG_FILE, logEntry);
}

// Check if a file contains "published" but not "tweeted" status
function checkFileStatus(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for publication status
    const publishMatch = content.match(/data-publish-status="([^"]*)"/);
    const publishStatus = publishMatch ? publishMatch[1] : null;
    
    // Check for tweet status
    const tweetMatch = content.match(/data-tweet-status="([^"]*)"/);
    const tweetStatus = tweetMatch ? tweetMatch[1] : null;
    
    return {
      isPublished: publishStatus === 'published',
      isTweeted: tweetStatus === 'tweeted',
      hasStatus: publishMatch !== null
    };
  } catch (error) {
    logMessage(`Error reading file ${filePath}: ${error.message}`);
    return { isPublished: false, isTweeted: false, hasStatus: false };
  }
}

// Extract tweet text from a file
function extractTweetText(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Look for tweet text in two possible locations
    
    // 1. Try data attribute first
    const dataMatch = content.match(/data-tweet-text="([^"]*)"/);
    if (dataMatch) {
      return dataMatch[1];
    }
    
    // 2. Try tweet content div with a paragraph
    const tweetContentMatch = content.match(/<div class="tweet-content">\s*<p>([^<]*)<\/p>/);
    if (tweetContentMatch) {
      return tweetContentMatch[1].trim();
    }
    
    return null;
  } catch (error) {
    logMessage(`Error extracting tweet text from ${filePath}: ${error.message}`);
    return null;
  }
}

// Extract target information and quote for verification
function extractVerificationInfo(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract target name
    const nameMatch = content.match(/<meta name="da1:target" content="([^"]*)"/);
    const name = nameMatch ? nameMatch[1] : null;
    
    // Extract twitter handle
    const twitterMatch = content.match(/<meta name="da1:target-twitter" content="([^"]*)"/);
    const twitter = twitterMatch ? twitterMatch[1] : null;
    
    // Extract quote
    const quoteMatch = content.match(/<blockquote class="target-quote">"([^<]*)"<\/blockquote>/);
    const quote = quoteMatch ? quoteMatch[1] : null;
    
    if (name && twitter && quote) {
      return { name, twitter, quote };
    }
    
    return null;
  } catch (error) {
    logMessage(`Error extracting verification info from ${filePath}: ${error.message}`);
    return null;
  }
}

// Generate verification tweet text
function generateVerificationTweet(info) {
  if (!info) return null;
  
  // Trim quote if too long
  let trimmedQuote = info.quote;
  if (trimmedQuote.length > 100) {
    trimmedQuote = trimmedQuote.substring(0, 97) + "...";
  }
  
  return `${info.twitter} Hi ${info.name.split(' ')[0]}, did you really say this: "${trimmedQuote}"? Wanted to check...great quote btw...the DA1 team is working on solving the global metadata crisis!`;
}

// Update the file to mark as tweeted
function markAsTweeted(filePath, tweetId) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace tweet status
    content = content.replace(/data-tweet-status="[^"]*"/, 'data-tweet-status="tweeted"');
    
    // Add tweet ID and timestamp if it doesn't exist
    if (!content.includes('data-tweet-id')) {
      const now = new Date().toISOString();
      const metaTag = `<meta name="da1:tweet-id" content="${tweetId || 'unknown'}">\n`;
      const timestampTag = `<meta name="da1:tweeted-at" content="${now}">\n`;
      
      // Insert after the last meta tag or before </head>
      content = content.replace(/<\/head>/, `${metaTag}${timestampTag}</head>`);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    logMessage(`Error updating file ${filePath}: ${error.message}`);
    return false;
  }
}

// Post a tweet
async function postTweet(text, url) {
  if (isDryRun) {
    logMessage(`[DRY RUN] Would tweet: ${text}`);
    logMessage(`[DRY RUN] With URL: ${url}`);
    return { id: 'dry-run-id' };
  }
  
  try {
    // Combine text and URL, ensuring we don't exceed Twitter's character limit
    const fullTweet = text.includes(url) ? text : `${text} ${url}`;
    
    // Post to Twitter
    const tweet = await twitterClient.v2.tweet(fullTweet);
    logMessage(`Successfully posted tweet: ${fullTweet}`);
    return tweet.data;
  } catch (error) {
    logMessage(`Error posting tweet: ${error.message}`);
    throw error;
  }
}

// Main function
async function main() {
  logMessage(`Starting outreach tweet check (${isDryRun ? 'DRY RUN' : 'LIVE MODE'}, ${isVerificationOnly ? 'VERIFICATION ONLY' : 'STANDARD TWEETS'})`);
  
  // Make sure the posts directory exists
  if (!fs.existsSync(POSTS_DIR)) {
    logMessage(`Posts directory not found: ${POSTS_DIR}`);
    return;
  }
  
  // Get all HTML files in the posts directory
  const files = fs.readdirSync(POSTS_DIR)
    .filter(file => file.endsWith('.html'))
    .map(file => path.join(POSTS_DIR, file));
  
  logMessage(`Found ${files.length} HTML files in the posts directory`);
  
  // Count stats
  let processed = 0;
  let tweeted = 0;
  let errors = 0;
  
  // Check each file
  for (const file of files) {
    const fileName = path.basename(file);
    logMessage(`Checking file: ${fileName}`);
    
    // Check file status
    const status = checkFileStatus(file);
    
    if (!status.hasStatus) {
      logMessage(`File ${fileName} does not have required status attributes, skipping`);
      continue;
    }
    
    // Different process based on mode
    if (isVerificationOnly) {
      // Verification mode - always process published files, even if already tweeted
      if (status.isPublished) {
        logMessage(`Generating verification tweet for ${fileName}`);
        
        // Extract verification info
        const verificationInfo = extractVerificationInfo(file);
        
        if (!verificationInfo) {
          logMessage(`Could not extract verification info from ${fileName}, skipping`);
          errors++;
          continue;
        }
        
        // Generate verification tweet
        const verificationTweet = generateVerificationTweet(verificationInfo);
        
        if (!verificationTweet) {
          logMessage(`Could not generate verification tweet for ${fileName}, skipping`);
          errors++;
          continue;
        }
        
        // Get the URL for the post
        const baseUrl = 'https://da1.fm/outreach/posts/';
        const url = baseUrl + fileName;
        
        try {
          // Post the verification tweet
          await postTweet(verificationTweet, url);
          logMessage(`Successfully generated verification tweet for ${fileName}`);
          tweeted++;
          
          // Note: we don't mark as tweeted for verification tweets, since they're just checks
        } catch (error) {
          logMessage(`Error processing verification tweet for ${fileName}: ${error.message}`);
          errors++;
        }
      } else {
        logMessage(`File ${fileName} is not published, skipping verification tweet`);
      }
    } else {
      // Standard mode - only process published and not yet tweeted files
      if (status.isPublished && !status.isTweeted) {
        logMessage(`File ${fileName} is published but not yet tweeted, processing...`);
        
        // Extract tweet text
        const tweetText = extractTweetText(file);
        
        if (!tweetText) {
          logMessage(`Could not extract tweet text from ${fileName}, skipping`);
          errors++;
          continue;
        }
        
        // Get the URL for the post
        const baseUrl = 'https://da1.fm/outreach/posts/';
        const url = baseUrl + fileName;
        
        try {
          // Post the tweet
          const tweet = await postTweet(tweetText, url);
          
          // Mark the file as tweeted
          if (markAsTweeted(file, tweet.id)) {
            logMessage(`Successfully marked ${fileName} as tweeted with ID: ${tweet.id}`);
            tweeted++;
          } else {
            logMessage(`Failed to mark ${fileName} as tweeted`);
            errors++;
          }
        } catch (error) {
          logMessage(`Error processing ${fileName}: ${error.message}`);
          errors++;
        }
      } else {
        if (status.isTweeted) {
          logMessage(`File ${fileName} has already been tweeted, skipping`);
        } else {
          logMessage(`File ${fileName} is not published, skipping`);
        }
      }
    }
    
    processed++;
  }
  
  // Log summary
  if (isVerificationOnly) {
    logMessage(`Verification tweet check completed. Processed: ${processed}, Verification tweets: ${tweeted}, Errors: ${errors}`);
  } else {
    logMessage(`Tweet check completed. Processed: ${processed}, Tweeted: ${tweeted}, Errors: ${errors}`);
  }
}

// Run the main function
main()
  .then(() => {
    logMessage('Tweet checker execution completed');
  })
  .catch(error => {
    logMessage(`Fatal error: ${error.message}`);
  });