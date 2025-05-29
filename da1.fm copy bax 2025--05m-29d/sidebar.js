/**
 * sidebar.js - Ensures proper Alpine.js initialization for the sidebar
 * This file handles both left and right sidebar functionality and ensures Alpine.js is properly loaded
 */

// Make sure Alpine.js is loaded before initializing sidebar
document.addEventListener('alpine:init', () => {
    // Register any global Alpine.js components, stores, or directives if needed
    // This function will run after Alpine.js has been loaded but before the DOM has been initialized

    // For debugging purposes
    console.log("Alpine.js initialized and sidebar.js loaded");
});

// Ensures the active page is correctly highlighted when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Get current page path
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop() || 'index.html';

    console.log("Current page:", pageName);

    // Apply active styling to the appropriate menu item based on the current path
    // This ensures only one menu item is highlighted at a time
    // This is done via Alpine.js conditionals for each menu item

    // Set initial state for main content based on left sidebar state
    const isLeftExpanded = localStorage.getItem('sidebarExpanded') !== 'false';
    if (!isLeftExpanded) {
        document.querySelector('.main-content')?.classList.add('sidebar-collapsed');
    }

    // Set initial state for main content based on right sidebar state
    const isRightExpanded = localStorage.getItem('sidebarRightExpanded') !== 'false';
    if (!isRightExpanded) {
        document.querySelector('.main-content')?.classList.add('sidebar-right-collapsed');
    }

    // Initialize accordion functionality for the right sidebar
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;

            if (content && content.classList.contains('accordion-content')) {
                content.classList.toggle('active');

                // Close other accordions (optional)
                if (content.classList.contains('active')) {
                    document.querySelectorAll('.accordion-content').forEach(item => {
                        if (item !== content) {
                            item.classList.remove('active');
                            if (item.previousElementSibling) {
                                item.previousElementSibling.classList.remove('active');
                            }
                        }
                    });
                }
            }
        });
    });
});