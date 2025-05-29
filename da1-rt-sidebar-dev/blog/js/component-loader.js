/**
 * DA1 Blog - Component Loader with Path Resolution
 * Loads HTML components with the correct path resolution for any blog page
 */

// Track loaded components to prevent duplicates
const loadedComponents = {};

// Function to determine the base path based on current page location
function getBasePath() {
    const path = window.location.pathname;
    
    if (path.includes('/articles/')) {
        // If we're in the articles subdirectory (e.g., /blog/articles/...)
        return '../';  // Go up one level to reach the blog directory
    } else if (path.includes('/blog/')) {
        // If we're in the main blog directory
        return './';  // Use current directory
    } else {
        // If we're somewhere else (e.g., root of the site)
        return './blog/';  // Go into the blog directory
    }
}

// Function to load HTML components dynamically with correct path resolution
function loadComponent(componentName, elementId) {
    // Skip if component already loaded
    if (loadedComponents[elementId]) {
        console.log(`Component ${elementId} already loaded, skipping.`);
        return Promise.resolve();
    }
    
    // Resolve the correct path based on current page location
    const basePath = getBasePath();
    const url = `${basePath}${componentName}`;
    
    console.log(`Loading component from ${url} into #${elementId}`);
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                console.error(`Failed to load ${url}, status: ${response.status}`);
                return "";
            }
            return response.text();
        })
        .then(data => {
            const element = document.getElementById(elementId);
            if (element) {
                if (!loadedComponents[elementId]) {
                    element.innerHTML = data;
                    loadedComponents[elementId] = true;
                }
            } else {
                console.error(`Element #${elementId} not found`);
            }
        })
        .catch(error => console.error("Error loading component:", error));
}

// Initialize UI components
function initializeUI() {
    // Initialize accordion toggles if any
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            
            if (content) {
                content.classList.toggle('active');
                
                // Ensure only one section is open at a time
                document.querySelectorAll('.accordion-content').forEach(item => {
                    if (item !== content) {
                        item.classList.remove('active');
                    }
                });
            }
        });
    });
}

// Function to add alphabetically sorted tags line under the article metadata
function addTagsToArticle() {
    // Only run this on article pages
    if (!window.location.pathname.includes('/articles/')) {
        return;
    }
    
    // Find the blog post meta info section
    const metaSection = document.querySelector('.blog-post-meta');
    if (!metaSection) {
        console.log('Blog post meta section not found');
        return;
    }
    
    // Get the metadata from the DA1 metadata script tag
    const metadataScript = document.querySelector('script#da1-metadata');
    if (!metadataScript) {
        console.log('DA1 metadata not found');
        return;
    }
    
    try {
        // Parse the metadata
        const metadata = JSON.parse(metadataScript.textContent);
        
        // Check if we have tags
        if (metadata.tags && metadata.tags.length > 0) {
            // Sort tags alphabetically
            const sortedTags = [...metadata.tags].sort();
            
            // Create the tags element
            const tagsElement = document.createElement('div');
            tagsElement.className = 'article-tags-display';
            tagsElement.innerHTML = `Tags: ${sortedTags.join(', ')}`;
            
            // Insert after the meta section
            metaSection.insertAdjacentElement('afterend', tagsElement);
            
            console.log('Added tags line to article');
        }
    } catch (error) {
        console.error('Error parsing DA1 metadata:', error);
    }
}

// Load components when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    console.log("Blog component loader: Loading components...");
    
    // Load all components with correct path resolution
    Promise.all([
        loadComponent("blog-left-sidebar.html", "left-sidebar-container"),
        loadComponent("blog-right-sidebar.html", "right-sidebar-container"),
        loadComponent("blog-footer.html", "footer-container")
    ]).then(() => {
        console.log("All blog components loaded successfully");
        setTimeout(() => {
            initializeUI();
            addTagsToArticle(); // Add tags to article pages
        }, 50);
    });
});