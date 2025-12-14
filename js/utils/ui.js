/* UI Utility - CashForge
   Handles global UI elements like Toast Notifications and formatting.
   
   Usage: 
   UI.toast('Login Successful', 'success');
   UI.toast('Insufficient Funds', 'error');
*/

const UI = {
    
    // --- 1. TOAST NOTIFICATIONS ---
    // Types: 'success', 'error', 'info'
    toast(message, type = 'info') {
        // Create container if it doesn't exist
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                width: 90%;
                max-width: 350px;
            `;
            document.body.appendChild(container);
        }

        // Define Colors based on type
        const colors = {
            success: { bg: '#eafaf1', border: '#2ecc71', text: '#27ae60', icon: 'check-circle' },
            error:   { bg: '#fdedec', border: '#e74c3c', text: '#c0392b', icon: 'alert-circle' },
            info:    { bg: '#e0ffff', border: '#00FFFF', text: '#008b8b', icon: 'info' }
        };
        const style = colors[type] || colors.info;

        // Create Toast Element
        const toastEl = document.createElement('div');
        toastEl.style.cssText = `
            background: ${style.bg};
            border-left: 5px solid ${style.border};
            color: ${style.text};
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            font-size: 13px;
            font-weight: 600;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
        `;

        // Icon Logic (using Lucide data-name if available, or simple SVG)
        // Since we can't easily inject lucide <i data-lucide> dynamically without re-running createIcons(),
        // we will use simple text/emoji or innerHTML for speed.
        let iconHtml = '';
        if(type === 'success') iconHtml = '<span style="margin-right:10px; font-size:16px;">✓</span>';
        if(type === 'error') iconHtml = '<span style="margin-right:10px; font-size:16px;">✕</span>';
        if(type === 'info') iconHtml = '<span style="margin-right:10px; font-size:16px;">ℹ</span>';

        toastEl.innerHTML = `${iconHtml}<span>${message}</span>`;
        container.appendChild(toastEl);

        // Animate In
        requestAnimationFrame(() => {
            toastEl.style.opacity = '1';
            toastEl.style.transform = 'translateY(0)';
        });

        // Auto Dismiss
        setTimeout(() => {
            toastEl.style.opacity = '0';
            toastEl.style.transform = 'translateY(-20px)';
            setTimeout(() => toastEl.remove(), 300);
        }, 3000); // 3 Seconds display time
    },

    // --- 2. FORMATTERS ---
    formatCurrency(amount) {
        return parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
};

// Expose globally
window.UI = UI;