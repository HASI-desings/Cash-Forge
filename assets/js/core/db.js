/**
 * CashForge Reactive State Manager (Supabase Ready)
 * Handles state store, subscriptions, and DOM binding using asynchronous DB calls.
 * Dependencies: config.js, db.js, auth.js
 */

const State = {
    
    // =================================
    // 1. CENTRAL STORE
    // =================================
    store: {
        user: null,
        balance: 0,
        vipLevel: 0,
        dailyYield: 0, 
        activeTasks: 0,
        isLoggedIn: false
    },

    listeners: {},

    // =================================
    // 2. INITIALIZATION & REFRESH
    // =================================
    
    /** Initializes the state by loading user data and setting up listeners. */
    init: async function() { 
        console.log("State: Initializing...");
        
        // Check authentication status
        const authenticated = await Auth.isAuthenticated();
        this.store.isLoggedIn = authenticated;

        if (authenticated) {
            // Load all necessary user-specific data asynchronously
            const user = await DB.getUser();
            const plans = await DB.getPlansData();
            const tasks = await DB.getTaskProgress();
            
            if (user) {
                // Batch update state
                this.store.user = user;
                this.store.balance = user.balance || 0;
                this.store.vipLevel = user.vip_level || 0; 
                this.store.dailyYield = FinanceManager.calculateDailyYield(plans) || 0; // Requires plan data
                
                // Calculate active tasks
                this.store.activeTasks = Math.max(0, CONFIG.TOTAL_DAILY_TASKS - (tasks.count || 0));
                
                // Trigger global UI updates after all data is loaded
                this.notifyAll();
            }
        }
        
        // Start listening for storage changes (Sync tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === 'supabase.auth.token') {
                this.refresh();
            }
        });
    },

    /** Pulls the latest data from the DB and updates the state/UI. */
    refresh: async function() { 
        console.log("State: Refreshing data from DB...");
        
        const user = await DB.getUser();
        const plans = await DB.getPlansData();
        
        if (user) {
            this.update('balance', user.balance);
            this.update('vipLevel', user.vip_level);
            this.update('user', user);
            this.update('dailyYield', FinanceManager.calculateDailyYield(plans));
        }
    },

    // =================================
    // 3. CORE METHODS & REACTIVITY
    // =================================
    
    get: function(key) {
        return this.store[key];
    },

    update: function(key, value) {
        if (this.store[key] === value) return;
        
        this.store[key] = value;
        
        // Save the user object back to DB if core profile data changed
        if (key === 'balance' || key === 'vipLevel' || key === 'user') {
             // DB interaction should be handled directly by calling function (e.g., DB.updateUserField)
             // State only persists non-profile data locally if needed.
        }

        // Notify subscribers
        this.notify(key, value);
    },

    notify: function(key, value) {
        if (this.listeners[key]) {
            this.listeners[key].forEach(callback => callback(value));
        }
    },
    
    notifyAll: function() {
         Object.keys(this.store).forEach(key => this.notify(key, this.store[key]));
    },

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
        
        // Run immediately with current value if available
        if (this.store[key] !== undefined && this.store[key] !== null) {
            callback(this.store[key]);
        }
    },

    /**
     * Bind a DOM element to a state key.
     * @param {string} key - State key (e.g., 'balance')
     * @param {string} elementId - DOM ID to update
     * @param {function} formatter - Optional format function (e.g., format currency)
     */
    bind: function(key, elementId, formatter = null) {
        const element = document.getElementById(elementId);
        if (!element) return; 

        this.subscribe(key, (value) => {
            const displayValue = formatter ? formatter(value) : value;
            
            // Animation for visual effect
            if (typeof value === 'number' && key === 'balance') {
                this.animateValue(element, displayValue);
            } else {
                element.innerText = displayValue;
            }
        });
    },

    // Helper: Number Counter Animation (Placeholder)
    animateValue: function(obj, endValue) {
        obj.innerText = endValue;
        obj.classList.add('animate-pulse-slow');
        setTimeout(() => obj.classList.remove('animate-pulse-slow'), 500);
    }
};

// =================================
// GLOBAL BINDINGS (Must run after init)
// =================================
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for the state to initialize and fetch data
    await State.init(); 

    // Bind Balance Headers
    State.bind('balance', 'header-balance', (val) => `${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(val)}`);
    State.bind('balance', 'wallet-balance', (val) => `${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(val)}`);
    State.bind('balance', 'main-balance', (val) => `${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(val)}`);
    
    // Bind User Info
    State.bind('user', 'user-name-display', (user) => user.name);
    State.bind('user', 'user-uid-display', (user) => user.uid);
});