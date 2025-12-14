/**
 * CashForge Notification System
 * Handles the display of clean, "built-in" toast notifications.
 * Dependency: Ensure 'toast' classes are defined in your css/core.css
 */

/**
 * Displays a toast notification on the screen.
 * @param {string} message - The text to display.
 * @param {string} type - 'success', 'error', 'info', or 'warning'.
 */
function showNotification(message, type = 'info') {
    // 1. Get the notification container
    let container = document.getElementById('toast-container');
    
    // 2. If container doesn't exist, create it dynamically
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        // Append to body
        document.body.appendChild(container);
    }

    // 3. Create the toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`; // e.g., "toast success"
    
    // 4. Determine the icon based on type
    let icon = 'ℹ️'; // Default Info
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⛔';
    if (type === 'warning') icon = '⚠️';

    // 5. Construct the HTML structure
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close" onclick="removeToast(this.parentElement)">×</button>
    `;

    // 6. Add to the container (Visible on screen)
    container.appendChild(toast);

    // 7. Auto-remove logic (4 Seconds)
    // We set a timer to trigger the fade-out animation
    setTimeout(() => {
        removeToast(toast);
    }, 4000);
}

/**
 * Helper function to remove a toast with animation.
 * @param {HTMLElement} toastElement 
 */
function removeToast(toastElement) {
    // Check if already removed to prevent errors
    if (!toastElement || !toastElement.parentElement) return;

    // Add fade-out animation class (must be defined in CSS)
    toastElement.style.animation = 'fadeOutRight 0.5s ease forwards';
    
    // Wait for animation to finish, then remove from DOM
    setTimeout(() => {
        if (toastElement.parentElement) {
            toastElement.remove();
        }
    }, 500); // Matches animation duration
}
