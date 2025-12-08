/**
 * 🧠 CASHFORGE STATE MANAGER
 * The centralized memory store for the application.
 * Modified to ensure balance updates are reliable and robust.
 */

export const State = {
    // --- 1. CORE DATA STORE ---
    user: null,         // Holds { id, email, full_name, balance, ... }
    wallets: [],        // Array of user's saved wallets
    activeTrade: null,  // Holds current active trade details or null
    tasks: {
        completedToday: [], 
        lastUpdated: null   
    },
    
    // --- 2. INITIALIZATION ---
    // Called when the app starts (after Auth check)
    init: (userData) => {
        State.user = userData;
        
        // [FIX] Force balance to be a number immediately to prevent string errors
        if (State.user && State.user.balance !== undefined) {
            State.user.balance = parseFloat(State.user.balance);
        }
        
        console.log("State Initialized:", State.user ? State.user.email : "No User");
        
        // Broadcast event that state is ready
        document.dispatchEvent(new CustomEvent('state-ready'));
    },

    // --- 3. REACTIVE UPDATES ---
    
    // [MODIFIED] Additive update (Current Balance + Amount)
    updateBalance: (amount) => {
        if (!State.user) {
            console.warn("State: Cannot update balance. User not initialized.");
            return;
        }
        
        const current = parseFloat(State.user.balance) || 0;
        const change = parseFloat(amount) || 0;
        const newBalance = current + change;

        State.user.balance = newBalance;
        
        // Use helper to broadcast
        State.notifyBalanceChange(newBalance);
    },

    // [NEW] Absolute set (Current Balance = Value)
    // Critical for syncing with Database fetch results (e.g. after page load)
    setBalance: (value) => {
        if (!State.user) return;

        const newBalance = parseFloat(value) || 0;
        State.user.balance = newBalance;
        
        // Use helper to broadcast
        State.notifyBalanceChange(newBalance);
    },

    // [NEW HELPER] Centralized broadcaster to avoid code duplication
    notifyBalanceChange: (newBalance) => {
        document.dispatchEvent(new CustomEvent('balance-updated', { 
            detail: { balance: newBalance } 
        }));
    },

    // Set active package locally
    setPackage: (packageId) => {
        if (!State.user) return;
        State.user.active_package_id = packageId;
    },

    // --- 4. GETTERS ---
    // Helper to get balance formatted safely
    getBalance: () => {
        return State.user ? parseFloat(State.user.balance) : 0;
    },

    // Helper to check if user has a PIN set
    hasPin: () => {
        return State.user && State.user.withdrawal_pin !== null;
    }
};
