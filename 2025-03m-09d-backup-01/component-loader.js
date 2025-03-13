/**
 * Component Loader
 * Handles dynamic loading of HTML components and UI interactions
 */

// Track which components have already been loaded to prevent duplicates
const loadedComponents = {};

// Function to handle accordion toggle
function toggleAccordion() {
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
}

// Initialize accordion content
function initializeAccordion() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.removeEventListener('click', toggleAccordion); // Prevent duplicate listeners
        header.addEventListener('click', toggleAccordion);
    });
}

// Function to load HTML components dynamically
function loadComponent(url, elementId) {
    // Skip if this component is already loaded
    if (loadedComponents[elementId]) {
        console.log(`Component ${elementId} already loaded, skipping.`);
        return Promise.resolve();
    }
    
    console.log(`Loading component: ${url} into ${elementId}`);
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                console.error(`Failed to load component: ${url}, status: ${response.status}`);
                return "";
            }
            return response.text();
        })
        .then(data => {
            const element = document.getElementById(elementId);
            if (element) {
                // Only insert HTML if this component hasn't been loaded yet
                if (!loadedComponents[elementId]) {
                    element.innerHTML = data;
                    loadedComponents[elementId] = true;
                    
                    // Special handling for the sidebar to ensure Alpine.js initializes correctly
                    if (elementId === "left-sidebar-container") {
                        // Give Alpine.js a moment to initialize the sidebar
                        setTimeout(() => {
                            console.log("Sidebar loaded and initialized");
                        }, 50);
                    }
                    
                    // If loading the footer, add Tawk.to script
                    if (elementId === "footer-container" && !window.tawkToInitialized) {
                        injectTawkTo();
                    }
                }
            } else {
                console.error(`Element with ID "${elementId}" not found`);
            }
        })
        .catch(error => console.error("Error loading component:", error));
}

// Initialize UI 
function initializeUI() {
    // Initialize accordion
    initializeAccordion();
}

// Load components when ready
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded, loading components...");
    Promise.all([
        loadComponent("left-sidebar.html", "left-sidebar-container"),
        loadComponent("right-sidebar.html", "right-sidebar-container"),
        loadComponent("./footer.html", "footer-container")
    ]).then(() => {
        console.log("All components loaded, initializing UI...");
        setTimeout(initializeUI, 50);
    });
});

// Handle window resize
window.addEventListener("resize", function() {
    initializeAccordion();
});