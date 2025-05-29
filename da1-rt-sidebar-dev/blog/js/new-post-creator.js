/**
 * Blog Post Creator Tool
 * 
 * This script helps create new blog posts based on the template.
 * Usage: node create-post.js "My Blog Post Title" "Author Name"
 */

const fs = require('fs');
const path = require('path');

// Get command line arguments
const title = process.argv[2] || 'New Blog Post';
const author = process.argv[3] || 'DA1 Team';

// Generate a slug from the title
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with a single one
        .trim(); // Trim leading/trailing spaces
};

const slug = generateSlug(title);
const date = new Date();
const isoDate = date.toISOString();
const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

// Create directories if they don't exist
const ensureDirExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
};

ensureDirExists(path.join(__dirname, 'articles'));
ensureDirExists(path.join(__dirname, 'images'));

// Create the blog post content
const postContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Core Meta Tags (These are always present) -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- DA1 Metadata - Will be expanded by script -->
    <script id="da1-metadata" type="application/json">
        {
            "title": "${title}",
            "description": "Enter a brief description here (150-160 characters)",
            "shortDescription": "Enter a shorter description for mobile/Twitter",
            "excerpt": "Enter a slightly longer excerpt for the blog index page",
            "url": "https://da1.fm/blog/articles/${slug}.html",
            "canonicalUrl": "https://da1.fm/blog/articles/${slug}.html",
            "author": {
                "name": "${author}",
                "jobTitle": "Enter author title",
                "url": "https://da1.fm/about/author"
            },
            "publishedDate": "${isoDate}",
            "modifiedDate": "${isoDate}",
            "category": "Enter category",
            "tags": ["Tag 1", "Tag 2", "Tag 3"],
            "image": {
                "url": "../images/${slug}.jpg",
                "width": 1200,
                "height": 630,
                "alt": "Description of the image"
            },
            "readingTime": "5 minutes",
            "wordCount": 0,
            "twitter": {
                "site": "@DA1metaMetaData",
                "creator": "@authorHandle"
            }
        }
    </script>
    
    <!-- CSS Links -->
    <link rel="stylesheet" href="../../resources/icons/bootstrap-icons.css">
    <link rel="stylesheet" href="../../index.css">
    <link rel="stylesheet" href="../css/blog.css">
    
    <!-- JS Dependencies -->
    <script defer type="module" src="../../js/alpinejs-local.js"></script>
    <script src="../../sidebar.js" defer></script>
    <script src="../../component-loader.js"></script>
    <script src="../js/metadata.js"></script>
</head>

<body>
    <!-- Left Sidebar -->
    <div id="left-sidebar-container"></div>

    <!-- Main Content -->
    <div class="main-content">
        <div class="blog-post-header">
            <div class="category-tag">Enter category</div>
            <h1>${title}</h1>
            <div class="blog-post-meta">
                <span><i class="bi bi-person"></i> ${author}</span>
                <span><i class="bi bi-calendar3"></i> ${formattedDate}</span>
                <span><i class="bi bi-clock"></i> 5 min read</span>
            </div>
        </div>

        <div class="blog-content">
            <p>Enter your blog post content here. This is the first paragraph that will appear on the page.</p>
            
            <!-- Optional Featured Image -->
            <img src="../images/${slug}.jpg" alt="Description of the image">
            
            <h2>First Section Heading</h2>
            
            <p>Content for the first section goes here.</p>
            
            <h2>Second Section Heading</h2>
            
            <p>Content for the second section goes here.</p>
            
            <!-- Article Tags -->
            <div class="blog-post-tags">
                <span class="blog-post-tag">Tag 1</span>
                <span class="blog-post-tag">Tag 2</span>
                <span class="blog-post-tag">Tag 3</span>
            </div>
        </div>
    </div>

    <!-- Right Sidebar -->
    <div id="right-sidebar-container"></div>

    <!-- Footer -->
    <div id="footer-container"></div>

    <!-- Scripts -->
    <script src="../../index.js"></script>
</body>
</html>`;

// Write the file
const filePath = path.join(__dirname, 'articles', `${slug}.html`);
fs.writeFileSync(filePath, postContent);

console.log(`\nBlog post created successfully: ${filePath}`);
console.log(`\nNext steps:`);
console.log(`1. Edit the post content`);
console.log(`2. Update the metadata in the da1-metadata block`);
console.log(`3. Add an image at: images/${slug}.jpg`);
console.log(`\nAccess your blog post at: /blog/articles/${slug}.html`);
