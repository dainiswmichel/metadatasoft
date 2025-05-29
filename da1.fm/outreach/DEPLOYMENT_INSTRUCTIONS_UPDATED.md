# Giscus Comments Implementation - Deployment Guide

## Current Status

- **Dr. Marco Iansiti Page**: Successfully updated with Giscus commenting system
- **Other Outreach Pages**: Need to be manually updated following the template

## What to Deploy for Production

### Files Ready for Deployment:
1. **dr-marco-iansiti.html**: This file has been successfully updated and can be deployed as is
2. **outreach.css**: Contains the styling for the comments section and is ready for deployment

### For Other Outreach Pages:
Use the dr-marco-iansiti.html file as a template. For each page you want to update:

1. Make a backup of the original file
2. Add the comments section right before the closing main content div:
   ```html
   <!-- Comments Section -->
   <div class="comments-section">
       <h2>Interactions & Comments</h2>
       <div class="giscus"></div>
   </div>
   ```

3. Add the Giscus script right before the closing body tag:
   ```html
   <!-- Giscus Comments -->
   <script src="https://giscus.app/client.js"
       data-repo="dainiswmichel/da1-discussions"
       data-repo-id="R_kgDOOnycXg"
       data-category="Announcements"
       data-category-id="DIC_kwDOOnycXs4Cp_zL"
       data-mapping="pathname"
       data-strict="0"
       data-reactions-enabled="1"
       data-emit-metadata="1"
       data-input-position="bottom"
       data-theme="light"
       data-lang="en"
       crossorigin="anonymous"
       async>
   </script>
   ```

## Upload Instructions

1. Upload the modified CSS file: `/outreach/css/outreach.css`
2. Upload the modified dr-marco-iansiti.html file: `/outreach/posts/dr-marco-iansiti.html`
3. As you update other outreach pages, upload them to the corresponding paths

## Using the Comments for Tweet Tracking

1. Open the page in a browser
2. Sign in with your GitHub account when prompted by Giscus
3. Leave comments to track tweet status, for example:
   - "Tweet 1 sent manually on April 29, 2025"
   - "Received response from Dr. Iansiti on May 1, 2025: [paste response]"
   - "Scheduled Tweet 2 for May 10, 2025"

## Comments Moderation

All comments are stored as GitHub Discussions in your repository: `dainiswmichel/da1-discussions`

To moderate:
1. Go to your repository on GitHub
2. Click on the "Discussions" tab
3. You can reply, edit, hide, or lock discussions as needed

## Troubleshooting

If comments don't appear correctly:
1. Ensure JavaScript is enabled in the browser
2. Check browser console for any errors
3. Verify that the GitHub repository is public and has Discussions enabled
4. Make sure the Giscus app is correctly installed and has permissions