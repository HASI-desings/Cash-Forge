/**
 * CashForge Reactive State Manager
 * Handles real-time UI updates across the application.
 * Dependencies: config.js, db.js
 */

const State = {
    
    // =================================
    // 1. CENTRAL STORE
    // =================================
    store: {
        user: null,
        balance: 0,
        vipLevel: 0,
        theme: 'light',
        notifications: 0,
        activeTasks: 0
    },

    // Event Listeners (Pub/Sub)
    listeners: {},

    // =================================
    // 2. INITIALIZATION
    // =================================
    init: function() {
        console.log("State: Initializing...");
        
        // Load User Data from DB
        const user = DB.getUser();
        
        if (user) {
            // Batch update state without triggering UI yet
            this.store.user = user;
            this.store.balance = user.balance;
            this.store.vipLevel = user.vipLevel;
            
            // Calculate active tasks/notifications (Mock)
            const tasks = DB.getTaskProgress();
            this.store.activeTasks = 3 - (tasks ? tasks.count : 0);
        }

        // Start listening for storage changes (Sync tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === CONFIG.STORAGE.USER_DATA) {
                this.refresh();
            }
        });
    },

    // =================================
    // 3. CORE METHODS
    // =================================
    
    // Get a value
    get: function(key) {
        return this.store[key];
    },

    // Update a value and notify listeners
    update: function(key, value) {
        if (this.store[key] === value) return; // No change

        this.store[key] = value;
        
        // Notify subscribers
        if (this.listeners[key]) {
            this.listeners[key].forEach(callback => callback(value));
        }

        // If updating balance/user, sync with DB
        if (key === 'balance' && this.store.user) {
            // Note: In a real app, API update happens here
            const user = DB.getUser();
            user.balance = value;
            DB.saveUser(user);
        }
    },

    // Refresh state from LocalStorage (Pull latest data)
    refresh: function() {
        const user = DB.getUser();
        if (user) {
            this.update('balance', user.balance);
            this.update('vipLevel', user.vipLevel);
            this.update('user', user);
        }
    },

    // =================================
    // 4. REACTIVITY (The Magic Part)
    // =================================

    /**
     * Subscribe to changes
     * @param {string} key - State key to watch (e.g., 'balance')
     * @param {function} callback - Function to run when data changes
     */
    subscribe: function(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
        
        // Run immediately with current value
        callback(this.store[key]);
    },

    /**
     * Bind a DOM element to a state key.
     * Automatically updates the text/html of the element when state changes.
     * * @param {string} key - State key (e.g., 'balance')
     * @param {string} elementId - DOM ID to update
     * @param {function} formatter - Optional format function (e.g., format currency)
     */
    bind: function(key, elementId, formatter = null) {
        const element = document.getElementById(elementId);
        if (!element) return; // Element not on this page

        this.subscribe(key, (value) => {
            const displayValue = formatter ? formatter(value) : value;
            
            // Animation for numbers
            if (typeof value === 'number' && key === 'balance') {
                this.animateValue(element, displayValue);
            } else {
                element.innerText = displayValue;
            }
        });
    },

    // Helper: Number Counter Animation
    animateValue: function(obj, endValue) {
        // Simple text update for now, can be expanded to count-up animation
        obj.innerText = endValue;
        obj.classList.add('animate-pulse');
        setTimeout(() => obj.classList.remove('animate-pulse'), 500);
    }
};

// Initialize State System
State.init();

// =================================
// GLOBAL BINDINGS
// These run on every page automatically
// =================================
document.addEventListener('DOMContentLoaded', () => {
    
    // Bind Balance Headers
    State.bind('balance', 'header-balance', (val) => CONFIG.formatCurrency(val));
    State.bind('balance', 'wallet-balance', (val) => CONFIG.formatCurrency(val));
    State.bind('balance', 'main-balance', (val) => CONFIG.formatCurrency(val));

    // Bind User Info
    const user = State.get('user');
    if (user) {
        // Find elements that might display name/ID
        const nameEl = document.getElementById('user-name-display');
        if (nameEl) nameEl.innerText = user.name;
        
        const uidEl = document.getElementById('user-uid-display');
        if (uidEl) uidEl.innerText = user.uid;
    }
});