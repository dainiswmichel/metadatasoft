# DA1 Outreach System

This directory contains the DA1 Outreach system which allows for targeted outreach to key individuals in the digital attribution space, with built-in Twitter integration.

## Directory Structure

- `/outreach` - Main outreach directory
  - `/posts` - Individual outreach HTML files
  - `/css` - Outreach-specific CSS
  - `/js` - JavaScript for the outreach system
  - `/images` - Images for outreach posts

## Key Files

- `index.html` - The main outreach landing page
- `outreach-template.html` - Template for creating new outreach posts
- `tweet-checker.js` - Script that checks for published posts that need to be tweeted
- `update-posts.sh` - Script to update the list of outreach posts

## Creating New Outreach Posts

1. Copy `outreach-template.html` to `/posts/your-target-name.html`
2. Edit the file to include:
   - Target information
   - Personalized message
   - Tweet content
   - Follow-up plan
3. Set `data-publish-status="published"` to make it visible on the outreach page
4. Run `./update-posts.sh` to update the outreach-posts.txt list

## Twitter Integration

The outreach system includes Twitter integration for automated posting. To set this up:

1. Copy `.env.example` to `.env`
2. Add your Twitter API credentials from developer.x.com
3. Install required Node.js packages:
   ```
   npm install twitter-api-v2 dotenv
   ```
4. To manually check for posts to tweet:
   ```
   node tweet-checker.js
   ```
5. For a dry run (no actual tweeting):
   ```
   node tweet-checker.js --dry-run
   ```

## Automated Tweeting

To automate the tweeting process, set up a cron job:

```
# Check for posts to tweet once per day at 10:00 AM
0 10 * * * cd /path/to/da1.fm/outreach && node tweet-checker.js
```

## Tweet Status

Outreach posts have a data attribute for tweet status:
- `data-tweet-status="pending"` - Not yet tweeted
- `data-tweet-status="scheduled"` - Scheduled to be tweeted
- `data-tweet-status="tweeted"` - Already tweeted

The tweet-checker.js script automatically updates the status to "tweeted" after successful posting.

## Manual Sharing

Each outreach post includes manual share buttons for:
- Direct Twitter sharing
- Copying tweet text to clipboard

These manual options provide flexibility when automated tweeting is not desired.