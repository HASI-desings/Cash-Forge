/**
 * CashForge Reactive State Manager (Supabase Final)
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
        
        const authenticated = await Auth.isAuthenticated();
        this.store.isLoggedIn = authenticated;
        
        if (authenticated) {
            const user = await DB.getUser();
            const activePlans = await DB.getMyActiveInvestments();
            const tasks = await DB.getTaskProgress();
            
            if (user) {
                // Batch update state
                this.store.user = user;
                this.store.balance = user.balance || 0;
                this.store.vipLevel = user.vip_level || 0; 
                
                // Calculate dynamic values
                this.store.dailyYield = FinanceManager.calculateDailyYield(activePlans);
                this.store.activeTasks = Math.max(0, CONFIG.TOTAL_DAILY_TASKS - (tasks.tasks_completed || 0));
                
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
        const activePlans = await DB.getMyActiveInvestments();
        const tasks = await DB.getTaskProgress();
        
        if (user) {
            this.update('balance', user.balance);
            this.update('vipLevel', user.vip_level);
            this.update('user', user);
            this.update('dailyYield', FinanceManager.calculateDailyYield(activePlans));
            this.update('activeTasks', Math.max(0, CONFIG.TOTAL_DAILY_TASKS - (tasks.tasks_completed || 0)));
        }
    },

    // =================================
    // 3. CORE METHODS & REACTIVITY
    // =================================
    
    get: function(key) { return this.store[key]; },

    update: function(key, value) {
        if (this.store[key] === value) return;
        this.store[key] = value;
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
     */
    subscribe: function(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
        
        if (this.store[key] !== undefined && this.store[key] !== null) {
            callback(this.store[key]);
        }
    },

    /**
     * Bind a DOM element to a state key.
     */
    bind: function(key, elementId, formatter = null) {
        const element = document.getElementById(elementId);
        if (!element) return; 

        this.subscribe(key, (value) => {
            const displayValue = formatter ? formatter(value) : value;
            
            if (typeof value === 'number' && key === 'balance') {
                this.animateValue(element, displayValue);
            } else {
                element.innerText = displayValue;
            }
        });
    },

    // Helper: Placeholder for number counter animation 
    animateValue: function(obj, endValue) {
        obj.innerText = endValue;
        obj.classList.add('animate-pulse-slow');
        setTimeout(() => obj.classList.remove('animate-pulse-slow'), 500);
    }
};

// =================================
// GLOBAL BINDINGS
// =================================
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for the state to initialize and fetch data
    await State.init(); 

    const pkrFormatter = (val) => `${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(val)}`;
    
    // Bind Balance Headers
    State.bind('balance', 'header-balance', pkrFormatter);
    State.bind('balance', 'wallet-balance', pkrFormatter);
    State.bind('balance', 'main-balance', pkrFormatter);
    
    // Bind User Info
    State.bind('user', 'user-name-display', (user) => user.name);
    State.bind('user', 'user-uid-display', (user) => user.uid);
    State.bind('vipLevel', 'vip-level-display', (level) => `VIP ${level}`);
    
    // Bind Daily Yield and Task Count
    State.bind('dailyYield', 'daily-yield-display', pkrFormatter);
    State.bind('activeTasks', 'tasks-remaining-display', (val) => val);
});
