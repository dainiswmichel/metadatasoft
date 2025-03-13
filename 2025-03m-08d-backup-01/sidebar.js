/**
 * sidebar.js - Ensures proper Alpine.js initialization for the sidebar
 * This file handles the sidebar functionality and ensures Alpine.js is properly loaded
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
    
    // You can add additional initialization logic here if needed
});