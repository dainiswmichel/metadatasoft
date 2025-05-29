/**
 * DA1 Outreach - Component Loader with Path Resolution
 * Loads HTML components with the correct path resolution for any outreach page
 */

// Track loaded components to prevent duplicates
const loadedComponents = {};

// Function to determine the base path based on current page location
function getBasePath() {
    const path = window.location.pathname;
    
    if (path.includes('/posts/')) {
        // If we're in the posts subdirectory (e.g., /outreach/posts/...)
        return '../';  // Go up one level to reach the outreach directory
    } else if (path.includes('/outreach/')) {
        // If we're in the main outreach directory
        return './';  // Use current directory
    } else {
        // If we're somewhere else (e.g., root of the site)
        return './outreach/';  // Go into the outreach directory
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
    
    // Initialize main content state based on both left and right sidebar states
    const isLeftExpanded = localStorage.getItem('sidebarExpanded') !== 'false';
    if (!isLeftExpanded) {
        document.querySelector('.main-content')?.classList.add('sidebar-collapsed');
    }
    
    const isRightExpanded = localStorage.getItem('sidebarRightExpanded') !== 'false';
    if (!isRightExpanded) {
        document.querySelector('.main-content')?.classList.add('sidebar-right-collapsed');
    }
}

// Function to add social sharing buttons to outreach posts
function addSocialSharingButtons() {
    // Only run this on outreach post pages
    if (!window.location.pathname.includes('/posts/')) {
        return;
    }
    
    // Find all tweet content sections
    const tweetContentElements = document.querySelectorAll('.tweet-content');
    if (tweetContentElements.length === 0) {
        console.log('No tweet content sections found');
        return;
    }
    
    // Add share buttons to each tweet content section
    tweetContentElements.forEach((tweetContentElement, index) => {
        // Skip if already has share buttons
        if (tweetContentElement.querySelector('.share-buttons')) {
            return;
        }
        
        // Get the tweet text
        const tweetTextElement = tweetContentElement.querySelector('p');
        if (!tweetTextElement) {
            console.log(`No tweet text found in tweet content section ${index}`);
            return;
        }
        
        const tweetText = tweetTextElement.textContent;
        
        // Create share buttons container
        const shareButtonsContainer = document.createElement('div');
        shareButtonsContainer.className = 'share-buttons';
        
        // Create Twitter share button
        const twitterButton = document.createElement('button');
        twitterButton.className = 'share-btn twitter-share';
        twitterButton.innerHTML = '<i class="bi bi-twitter"></i> Share on Twitter';
        twitterButton.setAttribute('data-tweet-text', tweetText);
        twitterButton.addEventListener('click', function() {
            const text = this.getAttribute('data-tweet-text');
            const url = window.location.href;
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, 
                '_blank', 'width=550,height=420');
            
            // Only update status for verification tweet (first tweet)
            if (index === 0) {
                // Update share status
                document.documentElement.setAttribute('data-tweet-status', 'tweeted');
                
                // Store share status in localStorage
                localStorage.setItem(`tweet_shared_${window.location.pathname}`, 'true');
            }
        });
        
        // Create Copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'share-btn copy-text';
        copyButton.innerHTML = '<i class="bi bi-clipboard"></i> Copy Text';
        copyButton.setAttribute('data-tweet-text', tweetText);
        copyButton.addEventListener('click', function() {
            const text = this.getAttribute('data-tweet-text');
            navigator.clipboard.writeText(text)
                .then(() => {
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="bi bi-check"></i> Copied!';
                    setTimeout(() => {
                        this.innerHTML = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Could not copy text: ', err);
                });
        });
        
        // Add buttons to container
        shareButtonsContainer.appendChild(twitterButton);
        shareButtonsContainer.appendChild(copyButton);
        
        // Add container after tweet text
        tweetContentElement.appendChild(shareButtonsContainer);
    });
    
    // Check if this post has been shared before (only affects first tweet status)
    const hasBeenShared = localStorage.getItem(`tweet_shared_${window.location.pathname}`) === 'true';
    if (hasBeenShared) {
        document.documentElement.setAttribute('data-tweet-status', 'tweeted');
    }
}

// Load components when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    console.log("Outreach component loader: Loading components...");
    
    // Load all components with correct path resolution
    Promise.all([
        loadComponent("outreach-left-sidebar.html", "left-sidebar-container"),
        loadComponent("outreach-right-sidebar.html", "right-sidebar-container"),
        loadComponent("outreach-footer.html", "footer-container")
    ]).then(() => {
        console.log("All outreach components loaded successfully");
        setTimeout(() => {
            initializeUI();
            addSocialSharingButtons(); // Add social share buttons to outreach posts
        }, 50);
    });
});