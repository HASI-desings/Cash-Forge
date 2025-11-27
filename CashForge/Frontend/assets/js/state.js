/**
 * 🧠 CASHFORGE STATE MANAGER
 * The centralized memory store for the application.
 * Holds active user data to reduce database calls and ensure instant UI updates.
 */

export const State = {
    // --- 1. CORE DATA STORE ---
    user: null,         // Holds { id, email, full_name, balance, ... }
    wallets: [],        // Array of user's saved wallets
    activeTrade: null,  // Holds current active trade details or null
    tasks: {
        completedToday: [], // Array of Task IDs completed today
        lastUpdated: null   // Timestamp
    },
    
    // --- 2. INITIALIZATION ---
    // Called when the app starts (after Auth check)
    init: (userData) => {
        State.user = userData;
        console.log("State Initialized:", State.user.email);
        
        // Broadcast event that state is ready
        document.dispatchEvent(new CustomEvent('state-ready'));
    },

    // --- 3. REACTIVE UPDATES ---
    
    // Update Balance locally and notify UI
    updateBalance: (amount) => {
        if (!State.user) return;
        
        const newBalance = parseFloat(State.user.balance) + parseFloat(amount);
        State.user.balance = newBalance;
        
        // Broadcast change so Header/UI updates instantly
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