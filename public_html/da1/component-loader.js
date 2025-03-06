/**
 * Component Loader
 * Handles dynamic loading of HTML components for better modularity
 */

// Function to handle accordion toggle
function toggleAccordion() {
    this.classList.toggle('active');
    this.nextElementSibling.classList.toggle('active');
}

// Initialize collapsible content (accordion functionality)
function initializeAccordion() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.removeEventListener('click', toggleAccordion); // Prevent duplicate listeners
        header.addEventListener('click', toggleAccordion);
    });
}

// Function to load HTML components dynamically
function loadComponent(url, elementId) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load component: ${url}, status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = data;
            } else {
                console.error(`Element with ID "${elementId}" not found`);
            }
            return data;
        })
        .catch(error => {
            console.error('Error loading component:', error);
        });
}

// Load all components when the page is ready
document.addEventListener('DOMContentLoaded', function () {
    const componentLoads = [
        loadComponent('left-sidebar.html', 'left-sidebar-container'),
        loadComponent('right-sidebar.html', 'right-sidebar-container'),
        loadComponent('footer.html', 'footer-container')
    ];

    // Ensure accordion functionality is applied after components are loaded
    Promise.all(componentLoads)
        .then(() => {
            setTimeout(() => {
                initializeAccordion(); // Attach event listeners after content is loaded

                // Highlight active navigation link
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                const navItems = document.querySelectorAll('.sidebar-left a');
                navItems.forEach(item => {
                    const href = item.getAttribute('href');
                    if (href === currentPage) {
                        item.classList.add('active');
                    }
                });
            }, 100);
        });
});
