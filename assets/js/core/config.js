/**
 * CashForge Configuration File
 * Central source of truth for app settings, constants, and mock data.
 */

const CONFIG = {
    // ============================
    // 1. APP IDENTITY
    // ============================
    APP_NAME: "CashForge",
    VERSION: "1.0.0",
    CURRENCY_CODE: "PKR",
    CURRENCY_SYMBOL: "Rs",

    // ============================
    // 2. FINANCIAL SETTINGS
    // ============================
    // 1 USDT = 285 PKR (Used in Deposit)
    EXCHANGE_RATE: 285, 
    
    // Withdrawal Fee: 0.07 = 7%
    WITHDRAWAL_FEE: 0.07, 
    
    // Minimum amounts
    MIN_DEPOSIT: 900,
    MIN_WITHDRAWAL: 1000,

    // Admin Wallet for Deposits (TRC20)
    // Users will send money here
    ADMIN_WALLET: "TVJ5... (Update with Real Address)", 

    // Referral Base Link
    REF_LINK_BASE: "https://cashforge.app/register.html?ref=",

    // ============================
    // 3. STORAGE KEYS (Prevents typos)
    // ============================
    STORAGE: {
        TOKEN: "cf_session_token",
        USER_DATA: "cf_user_data",
        PIN_SET: "cf_pin_set",
        USER_WALLET: "cf_user_wallet_addr",
        THEME: "cf_theme_pref"
    },

    // ============================
    // 4. INVESTMENT PLANS (Database)
    // ============================
    // Changing values here updates Dashboard and Packages page
    PLANS: [
        { id: 1, name: "Basic",     price: 900,     daily: 35,    days: 365, vip: 1 },
        { id: 2, name: "Standard",  price: 3900,    daily: 135,   days: 365, vip: 2 },
        { id: 3, name: "Advanced",  price: 8900,    daily: 300,   days: 365, vip: 3, popular: true },
        { id: 4, name: "Pro",       price: 18500,   daily: 620,   days: 365, vip: 4 },
        { id: 5, name: "Premium",   price: 32500,   daily: 1100,  days: 365, vip: 5 },
        { id: 6, name: "Supreme",   price: 54900,   daily: 2000,  days: 365, vip: 6 },
        { id: 7, name: "Elite",     price: 112000,  daily: 3900,  days: 365, vip: 7 },
        { id: 8, name: "Ultimate",  price: 250000,  daily: 8500,  days: 365, vip: 8 }
    ],

    // ============================
    // 5. VIP SALARY TIERS
    // ============================
    SALARY_TIERS: [
        { level: 1, req: 6,   amount: 5000 },
        { level: 2, req: 15,  amount: 15000 },
        { level: 3, req: 40,  amount: 50000 },
        { level: 4, req: 100, amount: 150000 },
        { level: 5, req: 250, amount: 300000 }
    ],

    // ============================
    // 6. UTILITY FUNCTIONS
    // ============================
    
    // Format numbers with commas (e.g., 1,000)
    formatCurrency: function(amount) {
        return amount.toLocaleString('en-US');
    },

    // Check if user is logged in
    checkAuth: function() {
        if (!localStorage.getItem(this.STORAGE.TOKEN)) {
            window.location.href = 'login.html';
        }
    }
};

// Freeze object to prevent accidental modifications during runtime
Object.freeze(CONFIG);