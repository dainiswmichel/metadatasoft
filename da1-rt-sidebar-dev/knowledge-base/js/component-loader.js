/**
 * DA1 Knowledge Base - Component Loader with Path Resolution
 * Loads HTML components with the correct path resolution for any KB page
 */

// Track loaded components to prevent duplicates
const loadedComponents = {};

// Function to determine the base path based on current page location
function getBasePath() {
    const path = window.location.pathname;
    console.log('Current path:', path);
    
    // Special case for VS Code Live Server which uses different path patterns
    if (window.location.port === '5500') {
        console.log('Detected VS Code Live Server');
        
        if (path.includes('/topics/')) {
            // If we're in the topics subdirectory
            console.log('In topics subdirectory (VS Code), using "../"');
            return '../';
        } else {
            // If we're in the main knowledge-base directory
            console.log('In knowledge-base directory (VS Code), using "./"');
            return './';
        }
    }
    
    // Standard path detection for other servers
    if (path.includes('/topics/')) {
        // If we're in the topics subdirectory
        console.log('In topics subdirectory, using "../"');
        return '../';  // Go up one level to reach the knowledge-base directory
    } else if (path.includes('/knowledge-base/') || path.endsWith('knowledge-base/index.html')) {
        // If we're in the main knowledge-base directory
        console.log('In knowledge-base directory, using "./"');
        return './';  // Use current directory
    } else {
        // If we're somewhere else (e.g., root of the site)
        console.log('In root directory, using "./knowledge-base/"');
        return './knowledge-base/';  // Go into the knowledge-base directory
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
    console.log("Initializing UI components including accordions");
    
    // Initialize accordion toggles if any
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            console.log("Accordion header clicked");
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            
            if (content) {
                content.classList.toggle('active');
                
                // Ensure only one section is open at a time
                document.querySelectorAll('.accordion-content').forEach(item => {
                    if (item !== content) {
                        item.classList.remove('active');
                        if (item.previousElementSibling && 
                            item.previousElementSibling.classList.contains('accordion-header')) {
                            item.previousElementSibling.classList.remove('active');
                        }
                    }
                });
            }
        });
    });
}

// Function to adjust sidebar links for proper navigation and highlight active topic
function adjustSidebarLinks() {
    // Get the current path to determine context
    const path = window.location.pathname;
    const inTopicPage = path.includes('/topics/');
    
    // Extract filename from path for determining current topic
    const currentFile = path.split('/').pop();
    console.log("Current file:", currentFile);
    
    // In a topic page, links need to be relative to the current directory
    if (inTopicPage) {
        console.log("In topic page, adjusting sidebar links");
        
        // Adjust topic links - ensure they point to the right place
        document.querySelectorAll('.sidebar-right a.topic-link').forEach(link => {
            const href = link.getAttribute('href');
            // Make sure relative path from topic page to another topic is correct
            if (href && !href.startsWith('../topics/')) {
                let adjustedHref = href;
                if (href.startsWith('./topics/')) {
                    adjustedHref = href.replace('./topics/', '../topics/');
                } else if (href.startsWith('./')) {
                    adjustedHref = '../topics/' + href.substring(2);
                }
                console.log(`Topic page: Adjusting link ${href} -> ${adjustedHref}`);
                link.setAttribute('href', adjustedHref);
            }
            
            // Highlight the current topic in the sidebar
            const linkFile = href.split('/').pop();
            if (linkFile === currentFile) {
                console.log("Found current topic in sidebar:", linkFile);
                link.classList.add('active-topic');
                
                // Also update the link text to match the exact title from the topic
                try {
                    // Try to get the title from the page metadata if possible
                    const metadataScript = document.querySelector('script#da1-metadata');
                    if (metadataScript) {
                        const metadata = JSON.parse(metadataScript.textContent);
                        if (metadata && metadata.title) {
                            link.textContent = metadata.title;
                        }
                    } else {
                        // Fallback to using the page title
                        const pageTitle = document.title;
                        if (pageTitle) {
                            // Extract just the title part (after any prefix)
                            const titleParts = pageTitle.split('-');
                            if (titleParts.length > 1) {
                                link.textContent = titleParts[titleParts.length - 1].trim();
                            } else {
                                link.textContent = pageTitle.trim();
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error updating title:", e);
                }
                
                // Make sure the parent accordion is open
                const accordionContent = link.closest('.accordion-content');
                if (accordionContent) {
                    accordionContent.classList.add('active');
                    
                    // Also make the header active
                    const header = accordionContent.previousElementSibling;
                    if (header && header.classList.contains('accordion-header')) {
                        header.classList.add('active');
                    }
                }
            }
        });
    } else {
        // In the main KB page, adjust paths to be relative to current location
        console.log("In main KB page, adjusting sidebar links");
        
        document.querySelectorAll('.sidebar-right a.topic-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('../topics/')) {
                // Change ../topics/ to ./topics/ from main KB page
                const adjustedHref = href.replace('../topics/', './topics/');
                console.log(`Main page: Adjusting link ${href} -> ${adjustedHref}`);
                link.setAttribute('href', adjustedHref);
            }
        });
        
        // Adjust KB home link
        document.querySelectorAll('.sidebar-right a.kb-home-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('../index.html')) {
                const adjustedHref = './index.html';
                console.log(`Main page: Adjusting KB home link ${href} -> ${adjustedHref}`);
                link.setAttribute('href', adjustedHref);
            }
        });
    }
    
    // Only on the main page, set "Development Guides" to be initially open
    if (!inTopicPage) {
        // Set development guides open initially on the main KB page
        const firstAccordion = document.querySelector('.accordion-header');
        if (firstAccordion) {
            console.log("Setting first accordion active on KB page");
            firstAccordion.classList.add('active');
            
            const content = firstAccordion.nextElementSibling;
            if (content) {
                content.classList.add('active');
            }
        }
        
        // Set KB Home link active on main KB page
        const kbHomeLink = document.querySelector('.kb-home-link');
        if (kbHomeLink) {
            console.log("Setting KB Home link active on main KB page");
            kbHomeLink.classList.add('active');
            kbHomeLink.style.color = 'var(--accent)';
        }
    }
}

// Function to add alphabetically sorted tags line under the topic metadata
function addTagsToTopic() {
    // Only run this on topic pages
    if (!window.location.pathname.includes('/topics/')) {
        return;
    }
    
    // Find the topic meta info section
    const metaSection = document.querySelector('.topic-meta');
    if (!metaSection) {
        console.log('Topic meta section not found');
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
            tagsElement.className = 'topic-tags-display';
            tagsElement.innerHTML = `Tags: ${sortedTags.join(', ')}`;
            
            // Insert after the meta section
            metaSection.insertAdjacentElement('afterend', tagsElement);
            
            console.log('Added tags line to topic');
        }
    } catch (error) {
        console.error('Error parsing DA1 metadata:', error);
    }
}

// Load components when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    console.log("Knowledge Base component loader: Loading components...");
    
    // Special detection for VS Code Live Server
    const isVSCodeLiveServer = window.location.port === '5500';
    const componentsToLoad = [];
    
    if (isVSCodeLiveServer) {
        // VS Code Live Server needs special handling
        componentsToLoad.push(
            loadComponent("kb-left-sidebar.html", "left-sidebar-container"),
            loadComponent("kb-right-sidebar.html", "right-sidebar-container"),
            loadComponent("kb-footer.html", "footer-container")
        );
    } else {
        // Standard component loading
        componentsToLoad.push(
            loadComponent("kb-left-sidebar.html", "left-sidebar-container"),
            loadComponent("kb-right-sidebar.html", "right-sidebar-container"),
            loadComponent("kb-footer.html", "footer-container")
        );
    }
    
    // Load all components with correct path resolution
    Promise.all(componentsToLoad)
        .then(() => {
            console.log("All KB components loaded successfully");
            // Wait a bit longer to ensure DOM is fully updated with components
            setTimeout(() => {
                document.querySelectorAll('.sidebar').forEach(sidebar => {
                    sidebar.setAttribute('x-cloak', '');
                });
                initializeUI();
                addTagsToTopic(); // Add tags to topic pages
                adjustSidebarLinks(); // Adjust links in sidebar for proper navigation
            }, 300); // Increased timeout to ensure components are fully loaded
        })
        .catch(error => {
            console.error("Error loading components:", error);
            // Fallback to direct HTML insertion if component loading fails
            if (document.getElementById("left-sidebar-container") && 
                !document.getElementById("left-sidebar-container").innerHTML) {
                console.log("Using fallback sidebar loading");
                document.getElementById("left-sidebar-container").innerHTML = 
                    '<div class="sidebar sidebar-left expanded"><div class="sidebar-header">' +
                    '<h2 class="sidebar-title">Knowledge Base</h2></div><nav><ul style="list-style: none; padding: 0; margin-top: 15px;">' +
                    '<li class="nav-item"><a href="../index.html" class="nav-link"><i class="bi bi-house-fill"></i><span class="nav-text">Home</span></a></li>' +
                    '<li class="nav-item"><a href="index.html" class="nav-link"><i class="bi bi-journal-bookmark-fill"></i><span class="nav-text">Knowledge Base</span></a></li>' +
                    '</ul></nav></div>';
            }
        });
});