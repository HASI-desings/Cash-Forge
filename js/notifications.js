/* js/utils/ui.js */

// --- 1. INJECT STYLES AUTOMATICALLY ---
// We add this here so you don't need to manually create a toast.css file.
const style = document.createElement('style');
style.innerHTML = `
    #notification-container {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 90%;
        max-width: 400px;
        pointer-events: none; /* Let clicks pass through container */
    }
    
    .toast {
        background: white;
        color: #333;
        padding: 15px 20px;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.9rem;
        font-weight: 500;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        pointer-events: auto;
        border-left: 5px solid #ccc;
    }

    .toast.show {
        opacity: 1;
        transform: translateY(0);
    }

    .toast.success { border-left-color: #2ecc71; }
    .toast.error { border-left-color: #e74c3c; }
    .toast.warning { border-left-color: #f39c12; }

    .toast-icon svg { width: 20px; height: 20px; }
    .toast.success .toast-icon { color: #2ecc71; }
    .toast.error .toast-icon { color: #e74c3c; }
    .toast.warning .toast-icon { color: #f39c12; }

    .toast-close {
        margin-left: auto;
        background: none;
        border: none;
        font-size: 1.2rem;
        color: #999;
        cursor: pointer;
    }
`;
document.head.appendChild(style);

// --- 2. CONTAINER LOGIC ---
let notificationContainer = document.getElementById('notification-container');

function getContainer() {
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    return notificationContainer;
}

// --- 3. ICONS (SVG Strings to avoid Emoji) ---
const icons = {
    info: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
};

// --- 4. EXPORTED FUNCTION ---
export function showToast(message, type = 'info') {
    const container = getContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconSvg = icons[type] || icons.info;

    toast.innerHTML = `
        <span class="toast-icon">${iconSvg}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 300);
    }, 3000);
}

// Make it available globally for inline HTML onclicks if needed
window.showToast = showToast;
