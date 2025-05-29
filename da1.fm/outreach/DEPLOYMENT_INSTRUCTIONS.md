# Giscus Comments Implementation Guide

This guide explains how to add Giscus comments to your outreach posts.

## What's Included

1. **giscus-template.html**: Contains the HTML code snippets to add to your posts
2. **CSS Styling**: Already added to your outreach.css file

## How to Add Comments to Each Page

### Step 1: Add Comments Section to HTML

Add this code right before the closing main-content div (before `</div><!-- Main Content -->`):

```html
<!-- Comments Section -->
<div class="comments-section">
    <h2>Interactions & Comments</h2>
    <div class="giscus"></div>
</div>
```

### Step 2: Add Giscus Script

Add this code right before the closing body tag (before `</body>`):

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

## Files to Upload to Live Server

1. Upload all modified HTML files (`/outreach/posts/*.html`)
2. Upload the CSS file (`/outreach/css/outreach.css`) if it has been modified

## Moderating Comments

Comments are stored in your GitHub repository: `dainiswmichel/da1-discussions`.

To moderate comments:
1. Go to your repository: https://github.com/dainiswmichel/da1-discussions
2. Click on the "Discussions" tab
3. Find the discussion corresponding to the page
4. Moderate comments as needed:
   - Reply to comments
   - Hide inappropriate comments
   - Lock discussions if needed

## Tweet Status Tracking

Use the comments section to track tweet status and interactions:
1. When you manually send a tweet, add a comment like: "Sent Tweet 1 on May 10, 2025"
2. When you receive a response, add a comment with the details
3. If needed, update the HTML directly to change the tweet status from "pending" to "tweeted"

## Troubleshooting

If the comments don't appear on your page:
1. Make sure the GitHub repository is public
2. Check that Discussions are enabled in the repository
3. Verify the Giscus app is authorized for your repository
4. Check for JavaScript errors in your browser's developer console

## Need Help?

If you encounter any issues, refer to the Giscus documentation at https://giscus.app/ or check your GitHub repository settings.