/**
 * CashForge Notification System
 * Replaces ugly browser alerts with clean, in-app toast notifications.
 */

// 1. Create the container for notifications if it doesn't exist
const notificationContainer = document.createElement('div');
notificationContainer.id = 'notification-container';
document.body.appendChild(notificationContainer);

// 2. The main function to trigger a notification
function showNotification(message, type = 'info') {
    // Types: 'success', 'error', 'info', 'warning'
    
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    
    // Icon selection based on type
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';
    if (type === 'warning') icon = '🔔';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    // Add to container
    notificationContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300); // Wait for fade out animation
    }, 4000);
}
