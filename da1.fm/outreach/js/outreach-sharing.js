/**
 * DA1 Outreach - Sharing JS
 * Handles share buttons and scheduled tweet notifications
 */

// Main function to run when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupShareButtons();
    setupTweetScheduler();
    checkTweetStatus();
});

// Set up share buttons
function setupShareButtons() {
    // Twitter share button functionality
    document.querySelectorAll('.twitter-share').forEach(button => {
        button.addEventListener('click', function() {
            const text = this.getAttribute('data-tweet-text');
            const url = window.location.href;
            
            // Open Twitter intent in new window
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, 
                '_blank', 'width=550,height=420');
            
            // Update share status
            updateShareStatus('tweeted');
            
            // Save to localStorage
            localStorage.setItem(`tweet_shared_${window.location.pathname}`, 'true');
        });
    });
    
    // Copy text functionality
    document.querySelectorAll('.copy-text').forEach(button => {
        button.addEventListener('click', function() {
            const text = this.getAttribute('data-tweet-text');
            
            // Copy to clipboard
            navigator.clipboard.writeText(text)
                .then(() => {
                    // Show success message
                    const originalText = button.innerHTML;
                    button.innerHTML = '<i class="bi bi-check"></i> Copied!';
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        button.innerHTML = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Could not copy text: ', err);
                });
        });
    });
}

// Set up tweet scheduler
function setupTweetScheduler() {
    // Check the publish status
    const publishStatus = document.documentElement.getAttribute('data-publish-status');
    
    // Only schedule tweets for published posts
    if (publishStatus === 'published') {
        // Check if this post is already scheduled for a tweet
        const isScheduled = localStorage.getItem(`tweet_scheduled_${window.location.pathname}`);
        
        if (!isScheduled) {
            // Schedule a tweet for 1 hour after page load
            localStorage.setItem(`tweet_scheduled_${window.location.pathname}`, 'true');
            
            // Set reminder for 1 hour from now
            const reminderTime = new Date();
            reminderTime.setHours(reminderTime.getHours() + 1);
            localStorage.setItem(`tweet_reminder_time_${window.location.pathname}`, reminderTime.toISOString());
            
            // Calculate time until reminder
            const timeUntilReminder = reminderTime.getTime() - new Date().getTime();
            
            // Set timeout for reminder
            setTimeout(() => {
                showTweetReminder();
            }, timeUntilReminder);
        } else {
            // Check if reminder time has passed
            const reminderTimeStr = localStorage.getItem(`tweet_reminder_time_${window.location.pathname}`);
            
            if (reminderTimeStr) {
                const reminderTime = new Date(reminderTimeStr);
                const now = new Date();
                
                if (now >= reminderTime) {
                    // Check if it has been tweeted
                    const isShared = localStorage.getItem(`tweet_shared_${window.location.pathname}`) === 'true';
                    
                    if (!isShared) {
                        showTweetReminder();
                    }
                } else {
                    // Set timeout for reminder
                    const timeUntilReminder = reminderTime.getTime() - now.getTime();
                    setTimeout(() => {
                        showTweetReminder();
                    }, timeUntilReminder);
                }
            }
        }
    }
}

// Show tweet reminder
function showTweetReminder() {
    // Check if already tweeted
    const isShared = localStorage.getItem(`tweet_shared_${window.location.pathname}`) === 'true';
    if (isShared) {
        return;
    }
    
    // Get post title and tweet text
    const title = document.title;
    const tweetText = document.querySelector('.tweet-content p')?.textContent || '';
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'tweet-reminder';
    notification.innerHTML = `
        <div class="reminder-header">
            <h3>Time to Share!</h3>
            <button class="close-reminder">&times;</button>
        </div>
        <div class="reminder-content">
            <p>This outreach post is ready to share on Twitter:</p>
            <p class="post-title">${title}</p>
            <div class="reminder-actions">
                <button class="share-now">
                    <i class="bi bi-twitter"></i> Share Now
                </button>
                <button class="remind-later">Remind Me Later</button>
            </div>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Add event listeners
    notification.querySelector('.close-reminder').addEventListener('click', () => {
        notification.remove();
    });
    
    notification.querySelector('.share-now').addEventListener('click', () => {
        // Open Twitter intent
        const url = window.location.href;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`, 
            '_blank', 'width=550,height=420');
        
        // Update share status
        updateShareStatus('tweeted');
        
        // Save to localStorage
        localStorage.setItem(`tweet_shared_${window.location.pathname}`, 'true');
        
        // Remove notification
        notification.remove();
    });
    
    notification.querySelector('.remind-later').addEventListener('click', () => {
        // Remind again in 1 hour
        const reminderTime = new Date();
        reminderTime.setHours(reminderTime.getHours() + 1);
        localStorage.setItem(`tweet_reminder_time_${window.location.pathname}`, reminderTime.toISOString());
        
        // Remove notification
        notification.remove();
    });
}

// Update share status
function updateShareStatus(status) {
    // Update data attribute
    document.documentElement.setAttribute('data-tweet-status', status);
    
    // Update status badge if exists
    const statusBadge = document.querySelector('.tweet-status');
    if (statusBadge) {
        statusBadge.className = `tweet-status ${status}`;
        statusBadge.textContent = status === 'tweeted' ? 'Shared on Twitter' : 'Not yet shared';
    }
}

// Check tweet status on page load
function checkTweetStatus() {
    const isShared = localStorage.getItem(`tweet_shared_${window.location.pathname}`) === 'true';
    
    if (isShared) {
        updateShareStatus('tweeted');
    }
}