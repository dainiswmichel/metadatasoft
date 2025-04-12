/**
 * DA1 Blog System - Dynamic Article Listing
 * Scans the articles directory and lists all articles found there
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add a loading indicator before starting scan
    const blogPostsContainer = document.getElementById('blog-posts');
    if (blogPostsContainer && !blogPostsContainer.querySelector('.loading-indicator')) {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.textContent = 'Loading articles...';
        blogPostsContainer.appendChild(loadingIndicator);
    }
    
    // Only run the article scanner on the main blog page
    const isBlogIndexPage = window.location.pathname.includes('/blog/') && 
                           !window.location.pathname.includes('/articles/');
    
    if (isBlogIndexPage) {
        // Scan for articles
        scanForArticles();
    }
});

/**
 * Scan the articles directory for blog posts
 */
function scanForArticles() {
    // Function to fetch article list using multiple methods
    fetchArticleList()
        .then(async articleFiles => {
            console.log('Article files found:', articleFiles);
            
            if (articleFiles.length === 0) {
                showNoArticlesMessage();
                return;
            }
            
            // Fetch metadata from each article
            const articlesMetadata = await Promise.all(
                articleFiles.map(async filename => {
                    try {
                        const articleUrl = './articles/' + filename;
                        console.log('Fetching article:', articleUrl);
                        
                        const response = await fetch(articleUrl);
                        if (!response.ok) {
                            throw new Error(`Failed to fetch article: ${response.status}`);
                        }
                        
                        const html = await response.text();
                        const metadata = extractMetadata(html, articleUrl);
                        
                        // Add the article path to the metadata
                        metadata.path = articleUrl;
                        return metadata;
                    } catch (error) {
                        console.error(`Error processing article ${filename}:`, error);
                        return null;
                    }
                })
            );
            
            // Get current date for date-based release filtering
            const currentDate = new Date();
            
            // Filter out null results, future articles, and sort by date (newest first)
            const validArticles = articlesMetadata
                .filter(article => article !== null)
                .filter(article => {
                    // Only show articles whose publish date has been reached
                    const publishDate = new Date(article.datePublished);
                    return publishDate <= currentDate;
                })
                .sort((a, b) => {
                    // Parse dates for sorting
                    const dateA = new Date(a.datePublished);
                    const dateB = new Date(b.datePublished);
                    return dateB - dateA; // Newest first
                });
            
            // Display articles in the blog posts container
            const blogPostsContainer = document.getElementById('blog-posts');
            if (blogPostsContainer) {
                blogPostsContainer.innerHTML = ''; // Clear loading indicator
                
                if (validArticles.length > 0) {
                    // Add each article to the container
                    validArticles.forEach(article => {
                        const articleElement = createArticleElement(article);
                        blogPostsContainer.appendChild(articleElement);
                    });
                } else {
                    showNoArticlesMessage();
                }
            }
        })
        .catch(error => {
            console.error('Error scanning for articles:', error);
            
            // Show error message in the blog posts container
            const blogPostsContainer = document.getElementById('blog-posts');
            if (blogPostsContainer) {
                blogPostsContainer.innerHTML = '<p class="error-message">Error loading articles. Please try again later.</p>';
            }
        });
}

// Display a message when no articles are found
function showNoArticlesMessage() {
    const blogPostsContainer = document.getElementById('blog-posts');
    if (blogPostsContainer) {
        blogPostsContainer.innerHTML = '';
        const noArticlesMsg = document.createElement('p');
        noArticlesMsg.className = 'no-articles-message';
        noArticlesMsg.textContent = 'No articles found.';
        blogPostsContainer.appendChild(noArticlesMsg);
    }
}

// Create an article element based on metadata
function createArticleElement(article) {
    const articleElement = document.createElement('article');
    articleElement.className = 'blog-post';
    
    // Format the date nicely if it's in ISO format
    let displayDate = article.datePublished;
    if (displayDate && displayDate.includes('T')) {
        try {
            const dateObj = new Date(displayDate);
            displayDate = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            console.error('Error formatting date:', e);
        }
    }
    
    // 1. Create hidden but filterable tags for search functionality (not visible)
    let filterableTags = '';
    if (article.tags && article.tags.length > 0) {
        // Include the category as a tag for filtering if it's not already in the tags
        let filterTags = [...article.tags];
        if (article.category && !filterTags.includes(article.category) && article.category !== 'Uncategorized') {
            filterTags.push(article.category);
        }
        filterableTags = `<div class="post-tags" style="display:none;">
            ${filterTags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
        </div>`;
    }
    
    // 2. Create visible but unclickable, alphabetically sorted tags for display
    let displayTags = '';
    if (article.tags && article.tags.length > 0) {
        // Make sure to include the category as a tag if it's not already in the tags array
        let allTags = [...article.tags];
        if (article.category && !allTags.includes(article.category) && article.category !== 'Uncategorized') {
            allTags.push(article.category);
        }
        // Sort tags alphabetically
        const sortedTags = allTags.sort();
        displayTags = `<div class="post-tags-display">
            Tags: ${sortedTags.join(', ')}
        </div>`;
    }
    
    // Determine if this is a Quick Takes post and add the appropriate class
    const categoryClass = article.category === 'Quick Takes' ? 'category-tag quick-takes-category' : 'category-tag';
    
    articleElement.innerHTML = `
        <h2><a href="${article.path}">${article.title}</a></h2>
        <div class="post-meta">
            <span><i class="bi bi-person"></i> ${article.authorName}</span>
            <span><i class="bi bi-calendar3"></i> ${displayDate}</span>
            ${article.readingTime ? `<span><i class="bi bi-clock"></i> ${article.readingTime}</span>` : ''}
        </div>
        <p>${article.excerpt}</p>
        ${displayTags}
        ${filterableTags}
        <a href="${article.path}" class="read-more">Read More <i class="bi bi-arrow-right"></i></a>
    `;
    
    return articleElement;
}

/**
 * Extracts metadata from article HTML using DA1 MetaMetaTags or direct JSON metadata
 */
function extractMetadata(html, articleUrl) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // First check if there's a DA1 metadata JSON block
    const metadataScript = doc.querySelector('script#da1-metadata');
    if (metadataScript) {
        try {
            // Parse the DA1 metadata JSON
            const metadata = JSON.parse(metadataScript.textContent);
            
            // Return the necessary properties for display
            return {
                title: metadata.title || 'Untitled Post',
                description: metadata.description || '',
                excerpt: metadata.excerpt || metadata.description || '',
                datePublished: metadata.publishedDate || new Date().toISOString(),
                dateModified: metadata.modifiedDate || metadata.publishedDate || new Date().toISOString(),
                authorName: metadata.author?.name || 'Unknown Author',
                authorJobTitle: metadata.author?.jobTitle || '',
                image: metadata.image?.url || '',
                category: metadata.category || '',
                tags: metadata.tags || [],
                readingTime: metadata.readingTime || null,
                url: articleUrl
            };
        } catch (e) {
            console.warn('Failed to parse DA1 metadata JSON:', e);
            // If JSON parsing failed, fall back to meta tag extraction
        }
    }
    
    // Fallback to traditional meta tag extraction if JSON isn't available
    // Function to get meta content by name or property
    const getMeta = (name, property) => {
        let meta = doc.querySelector(`meta[name="${name}"]`);
        if (!meta && property) {
            meta = doc.querySelector(`meta[property="${property}"]`);
        }
        return meta ? meta.getAttribute('content') : null;
    };
    
    // Extract metadata using DA1 MetaMetaTags
    const title = doc.querySelector('title')?.textContent || 
                 getMeta('title', 'og:title') || 
                 'Untitled Post';
    
    const description = getMeta('description', 'og:description') || '';
    const excerpt = getMeta('article:excerpt') || description;
    const datePublished = getMeta('article:published_time') || new Date().toISOString();
    const dateModified = getMeta('article:modified_time') || datePublished;
    const authorName = getMeta('author', 'article:author') || 'Unknown Author';
    const authorTitle = doc.querySelector('script[type="application/ld+json"]')?.textContent || '';
    let authorJobTitle = '';
    
    // Try to extract author title from JSON-LD if available
    if (authorTitle) {
        try {
            const jsonLd = JSON.parse(authorTitle);
            authorJobTitle = jsonLd.author?.jobTitle || '';
        } catch (e) {
            console.warn('Failed to parse JSON-LD');
        }
    }
    
    // Extract image
    const image = getMeta('og:image') || '';
    
    // Extract category
    const category = getMeta('article:section') || '';
    
    // Extract tags
    const tags = [];
    doc.querySelectorAll('meta[property="article:tag"]').forEach(tag => {
        tags.push(tag.getAttribute('content'));
    });
    
    // Extract reading time
    const readingTime = getMeta('twitter:label1') === 'Reading time' ? 
                       getMeta('twitter:data1') : null;
    
    return {
        title,
        description,
        excerpt,
        datePublished,
        dateModified,
        authorName,
        authorJobTitle,
        image,
        category,
        tags,
        readingTime,
        url: articleUrl
    };
}

/**
 * Fetches a list of article files using multiple fallback methods
 * This robust approach tries several methods to find articles
 */
async function fetchArticleList() {
    const articlesDir = './articles/';
    let articleFiles = [];

    console.log('Starting article detection...');
    
    // Method 1: Try to fetch articles from articles.txt (most reliable)
    try {
        const response = await fetch('./articles.txt');
        if (response.ok) {
            const text = await response.text();
            articleFiles = text.split('\n')
                .map(line => line.trim())
                .filter(line => line && line.endsWith('.html'));
                
            if (articleFiles.length > 0) {
                console.log(`Found ${articleFiles.length} articles via articles.txt`);
                return articleFiles;
            }
        }
    } catch (e) {
        console.log('No articles.txt file found or error reading it:', e);
    }
    
    // Method 2: Try to fetch the directory listing (if enabled on server)
    try {
        const directoryResponse = await fetch(articlesDir);
        
        if (directoryResponse.ok) {
            const html = await directoryResponse.text();
            
            // Parse the HTML directory listing
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract all HTML file links
            articleFiles = Array.from(doc.querySelectorAll('a'))
                .map(a => a.getAttribute('href'))
                .filter(href => href && href.endsWith('.html') && href !== 'index.html' && href !== 'article-template.html');
                
            if (articleFiles.length > 0) {
                console.log(`Found ${articleFiles.length} articles via directory listing`);
                return articleFiles;
            }
        }
    } catch (e) {
        console.log('Directory listing not available:', e);
    }
    
    // Method 3: Try to fetch articles from PHP lister (if available)
    try {
        const response = await fetch('./list-articles.php');
        if (response.ok) {
            const text = await response.text();
            articleFiles = text.split('\n')
                .map(line => line.trim())
                .filter(line => line && line.endsWith('.html'));
                
            if (articleFiles.length > 0) {
                console.log(`Found ${articleFiles.length} articles via PHP lister`);
                return articleFiles;
            }
        }
    } catch (e) {
        console.log('PHP article lister not available');
    }
    
    // Method 4: Check for common article filenames
    console.log('No article list found, checking for individual articles');
    const commonArticleNames = [
        'sample-01.html',
        'the-future-of-music-rights.html',
        'sample.html',
        'metametadata-bridge.html',
        'introduction.html',
        'welcome.html',
        'first-post.html',
        'article-1.html',
        'about-da1.html'
    ];
    
    // Try each file individually to see which ones exist
    const existingArticles = [];
    
    await Promise.all(commonArticleNames.map(async (filename) => {
        try {
            const response = await fetch(`${articlesDir}${filename}`, { method: 'HEAD' });
            if (response.ok) {
                existingArticles.push(filename);
            }
        } catch (e) {
            // File doesn't exist, ignore
        }
    }));
    
    if (existingArticles.length > 0) {
        console.log(`Found ${existingArticles.length} articles by checking common filenames`);
        return existingArticles;
    }
    
    // Method 5: Final fallback - scan for any .html files
    console.log('No known articles found, scanning for any HTML files');
    try {
        // Use a more aggressive approach to find any HTML files
        const scanResults = [];
        
        // Check a set of potential articles with numerical patterns
        for (let i = 1; i <= 10; i++) {
            const potentialNames = [
                `article-${i}.html`,
                `post-${i}.html`,
                `blog-${i}.html`
            ];
            
            await Promise.all(potentialNames.map(async (filename) => {
                try {
                    const response = await fetch(`${articlesDir}${filename}`, { method: 'HEAD' });
                    if (response.ok) {
                        scanResults.push(filename);
                    }
                } catch (e) {
                    // File doesn't exist, ignore
                }
            }));
        }
        
        if (scanResults.length > 0) {
            console.log(`Found ${scanResults.length} articles through numerical scanning`);
            return scanResults;
        }
    } catch (e) {
        console.log('Error during aggressive file scanning:', e);
    }
    
    // If all methods fail, use a hardcoded fallback
    console.warn('No articles found through any method, using fallback list');
    return ['sample-01.html', 'the-future-of-music-rights.html'];
}