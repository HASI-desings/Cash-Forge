/**
 * 🎨 CASHFORGE UI CONTROLLER
 * Handles Toasts, Modals, Loaders, and Visual Feedback.
 */

export const UI = {
    
    // --- 1. TOAST NOTIFICATIONS ---
    showToast: (message, type = 'info') => {
        const toast = document.createElement('div');
        const icon = type === 'success' ? 'ph-check-circle' : 
                     type === 'error' ? 'ph-warning-circle' : 'ph-info';
        
        // Tailwind classes for the toast
        const colorClass = type === 'success' ? 'bg-green-50 text-green-600 border-green-200' : 
                           type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 
                           'bg-white text-slate-700 border-slate-200';

        toast.className = `toast active ${colorClass}`;
        toast.innerHTML = `
            <i class="ph-fill ${icon} text-lg"></i>
            <span class="font-bold text-sm">${message}</span>
        `;

        document.body.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 400); // Wait for transition
        }, 3000);
    },

    // --- 2. MODAL MANAGEMENT ---
    openModal: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            // Slight delay for CSS opacity transition to trigger
            requestAnimationFrame(() => {
                modal.classList.add('active');
            });
        }
    },

    closeModal: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300); // Match CSS transition duration
        }
    },

    // --- 3. LOADING SPINNERS ---
    // Toggles a global full-screen loader
    toggleGlobalLoader: (show) => {
        let loader = document.getElementById('global-loader');
        
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.className = 'fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex items-center justify-center transition-opacity duration-300 opacity-0 pointer-events-none';
            loader.innerHTML = `<div class="loader-spinner w-10 h-10 border-4 border-cyan-200 border-t-cyan-500"></div>`;
            document.body.appendChild(loader);
        }

        if (show) {
            loader.style.pointerEvents = 'all';
            loader.classList.remove('opacity-0');
        } else {
            loader.classList.add('opacity-0');
            loader.style.pointerEvents = 'none';
        }
    },

    // Toggles a spinner inside a button
    setButtonLoading: (btn, isLoading, originalText = "") => {
        if (isLoading) {
            btn.dataset.originalText = btn.innerHTML; // Save text
            btn.classList.add('opacity-70', 'pointer-events-none');
            btn.innerHTML = `<div class="btn-loader mx-auto"></div>`;
        } else {
            btn.classList.remove('opacity-70', 'pointer-events-none');
            btn.innerHTML = originalText || btn.dataset.originalText;
        }
    },

    // --- 4. TAB SWITCHING ---
    // Used in History, Support, etc.
    switchTab: (tabId, containerId) => {
        // Reset all tabs in this container
        const container = document.getElementById(containerId);
        if(!container) return;

        const tabs = container.querySelectorAll('.tab-btn');
        tabs.forEach(t => {
            t.classList.remove('active', 'border-cyan-400', 'text-cyan-600');
            t.classList.add('text-slate-400', 'border-transparent');
        });

        // Activate selected
        const activeTab = document.getElementById(tabId);
        if(activeTab) {
            activeTab.classList.add('active', 'border-cyan-400', 'text-cyan-600');
            activeTab.classList.remove('text-slate-400', 'border-transparent');
        }
    },

    // --- 5. FORMATTERS ---
    formatCurrency: (value) => {
        return '₨ ' + parseFloat(value).toLocaleString('en-PK', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    },

    formatDate: (dateString) => {
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
};