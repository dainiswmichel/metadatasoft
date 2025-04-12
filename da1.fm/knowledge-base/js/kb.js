/**
 * DA1 Knowledge Base System - Dynamic Topic Listing
 * Scans the topics directory and lists all topics found there
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add a loading indicator before starting scan
    const kbTopicsContainer = document.getElementById('kb-topics');
    if (kbTopicsContainer && !kbTopicsContainer.querySelector('.loading-indicator')) {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.textContent = 'Loading topics...';
        kbTopicsContainer.appendChild(loadingIndicator);
    }
    
    // Only run the topic scanner on the main KB page
    const isKBIndexPage = window.location.pathname.includes('/knowledge-base/') && 
                          !window.location.pathname.includes('/topics/');
    
    // For Live Server specific path
    const isLiveServerKBPage = window.location.pathname.includes('/da1.fm/knowledge-base/') && 
                              !window.location.pathname.includes('/topics/');
    
    if (isKBIndexPage || isLiveServerKBPage) {
        // Scan for topics
        scanForTopics();
    }
});

/**
 * Scan the topics directory for KB topics
 */
function scanForTopics() {
    // Function to fetch topic list using multiple methods
    fetchTopicList()
        .then(async topicFiles => {
            console.log('Topic files found:', topicFiles);
            
            if (topicFiles.length === 0) {
                showNoTopicsMessage();
                return;
            }
            
            // Fetch metadata from each topic
            const topicsMetadata = await Promise.all(
                topicFiles.map(async filename => {
                    try {
                        const topicUrl = './topics/' + filename;
                        console.log('Fetching topic:', topicUrl);
                        
                        const response = await fetch(topicUrl);
                        if (!response.ok) {
                            throw new Error(`Failed to fetch topic: ${response.status}`);
                        }
                        
                        const html = await response.text();
                        const metadata = extractMetadata(html, topicUrl);
                        
                        // Add the topic path to the metadata
                        metadata.path = topicUrl;
                        return metadata;
                    } catch (error) {
                        console.error(`Error processing topic ${filename}:`, error);
                        return null;
                    }
                })
            );
            
            // Get current date for date-based release filtering
            const currentDate = new Date();
            
            // Filter out null results and far-future topics (allow tomorrow for timezone differences)
            const validTopics = topicsMetadata
                .filter(topic => topic !== null)
                .filter(topic => {
                    // Allow topics with publish dates up to tomorrow to account for timezone differences
                    const publishDate = new Date(topic.datePublished);
                    const tomorrow = new Date(currentDate);
                    tomorrow.setDate(currentDate.getDate() + 1);
                    return publishDate <= tomorrow;
                })
                .sort((a, b) => {
                    // Parse dates for sorting
                    const dateA = new Date(a.datePublished);
                    const dateB = new Date(b.datePublished);
                    return dateB - dateA; // Newest first
                });
            
            // Display topics in the KB topics container
            const kbTopicsContainer = document.getElementById('kb-topics');
            if (kbTopicsContainer) {
                kbTopicsContainer.innerHTML = ''; // Clear loading indicator
                
                if (validTopics.length > 0) {
                    // Add each topic to the container
                    validTopics.forEach(topic => {
                        const topicElement = createTopicElement(topic);
                        kbTopicsContainer.appendChild(topicElement);
                    });
                } else {
                    showNoTopicsMessage();
                }
            }
        })
        .catch(error => {
            console.error('Error scanning for topics:', error);
            
            // Show error message in the KB topics container
            const kbTopicsContainer = document.getElementById('kb-topics');
            if (kbTopicsContainer) {
                kbTopicsContainer.innerHTML = '<p class="error-message">Error loading topics. Please try again later.</p>';
            }
        });
}

// Display a message when no topics are found
function showNoTopicsMessage() {
    const kbTopicsContainer = document.getElementById('kb-topics');
    if (kbTopicsContainer) {
        kbTopicsContainer.innerHTML = '';
        const noTopicsMsg = document.createElement('p');
        noTopicsMsg.className = 'no-topics-message';
        noTopicsMsg.textContent = 'No topics found.';
        kbTopicsContainer.appendChild(noTopicsMsg);
    }
}

// Create a topic element based on metadata
function createTopicElement(topic) {
    const topicElement = document.createElement('article');
    topicElement.className = 'kb-topic';
    
    // Format the date nicely if it's in ISO format
    let displayDate = topic.datePublished;
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
    if (topic.tags && topic.tags.length > 0) {
        // Include the category as a tag for filtering if it's not already in the tags
        let filterTags = [...topic.tags];
        if (topic.category && !filterTags.includes(topic.category) && topic.category !== 'Uncategorized') {
            filterTags.push(topic.category);
        }
        filterableTags = `<div class="topic-tags" style="display:none;">
            ${filterTags.map(tag => `<span class="topic-tag">${tag}</span>`).join('')}
        </div>`;
    }
    
    // 2. Create visible but unclickable, alphabetically sorted tags for display
    let displayTags = '';
    if (topic.tags && topic.tags.length > 0) {
        // Make sure to include the category as a tag if it's not already in the tags array
        let allTags = [...topic.tags];
        if (topic.category && !allTags.includes(topic.category) && topic.category !== 'Uncategorized') {
            allTags.push(topic.category);
        }
        // Sort tags alphabetically
        const sortedTags = allTags.sort();
        displayTags = `<div class="topic-tags-display">
            Tags: ${sortedTags.join(', ')}
        </div>`;
    }
    
    // Determine if this is a Technical topic and add the appropriate class
    const categoryClass = topic.category === 'Technical' ? 'category-tag technical-category' : 'category-tag';
    
    topicElement.innerHTML = `
        <h2><a href="${topic.path}">${topic.title}</a></h2>
        <div class="topic-meta">
            <span><i class="bi bi-person"></i> ${topic.authorName}</span>
            <span><i class="bi bi-calendar3"></i> ${displayDate}</span>
            ${topic.readingTime ? `<span><i class="bi bi-clock"></i> ${topic.readingTime}</span>` : ''}
        </div>
        <p>${topic.excerpt}</p>
        ${displayTags}
        ${filterableTags}
        <a href="${topic.path}" class="read-more">Read More <i class="bi bi-arrow-right"></i></a>
    `;
    
    return topicElement;
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
 * Fetches a list of topic files using multiple fallback methods
 * This robust approach tries several methods to find topics
 */
async function fetchTopicList() {
    const topicsDir = './topics/';
    let topicFiles = [];

    console.log('Starting topic detection...');
    
    // Method 1: Try to fetch topics from kb-topics.txt (most reliable)
    try {
        const response = await fetch('./kb-topics.txt');
        if (response.ok) {
            const text = await response.text();
            topicFiles = text.split('\n')
                .map(line => line.trim())
                .filter(line => line && line.endsWith('.html'));
                
            if (topicFiles.length > 0) {
                console.log(`Found ${topicFiles.length} topics via kb-topics.txt`);
                return topicFiles;
            }
        }
    } catch (e) {
        console.log('No kb-topics.txt file found or error reading it:', e);
    }
    
    // Method 2: Try to fetch the directory listing (if enabled on server)
    try {
        const directoryResponse = await fetch(topicsDir);
        
        if (directoryResponse.ok) {
            const html = await directoryResponse.text();
            
            // Parse the HTML directory listing
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract all HTML file links
            topicFiles = Array.from(doc.querySelectorAll('a'))
                .map(a => a.getAttribute('href'))
                .filter(href => href && href.endsWith('.html') && href !== 'index.html');
                
            if (topicFiles.length > 0) {
                console.log(`Found ${topicFiles.length} topics via directory listing`);
                return topicFiles;
            }
        }
    } catch (e) {
        console.log('Directory listing not available:', e);
    }
    
    // If using VS Code Live Server, use hardcoded list for reliability
    if (window.location.port === '5500') {
        console.log('VS Code Live Server detected, using hardcoded topic list');
        topicFiles = [
            'what-is-metametadata.html',
            'da1-code-commenting-standards.html',
            'da1-npm-instructions-and-standards.html',
            'devnotes.html',
            'from-idea-to-pseudocode-to-code-at-da1.html',
            'how-to-prompt-ai-to-code-well.html',
            'id3v2-metatags-reference.html'
        ];
        return topicFiles;
    }
    
    // If all methods fail, use a hardcoded fallback
    console.warn('No topics found through any method, using fallback list');
    return [
        'what-is-metametadata.html',
        'da1-code-commenting-standards.html',
        'da1-npm-instructions-and-standards.html',
        'devnotes.html',
        'from-idea-to-pseudocode-to-code-at-da1.html',
        'how-to-prompt-ai-to-code-well.html',
        'id3v2-metatags-reference.html'
    ];
}