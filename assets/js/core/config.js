/**
 * CashForge Configuration File (Supabase Final)
 * Central source of truth for app settings, financial thresholds, and business logic tables.
 */

const CONFIG = {
    // ============================
    // 1. APP IDENTITY & GLOBALS
    // ============================
    APP_NAME: "CashForge",
    VERSION: "1.0.0",
    
    // Logo Path (Required for fixing UI across all pages)
    LOGO_PATH: "/assets/img/logo.svg", // Assuming logo is placed in assets/img/

    // Financial Identity
    CURRENCY_CODE: "PKR",
    CURRENCY_SYMBOL: "Rs",

    // ============================
    // 2. FINANCIAL THRESHOLDS (Business Rules)
    // ============================
    // Exchange Rate: 1 USDT = 285 PKR
    EXCHANGE_RATE: 285, 
    
    // Minimums/Maximums
    MIN_DEPOSIT: 500,
    MIN_WITHDRAWAL: 1000,
    
    // Withdrawal Fee: 7%
    WITHDRAWAL_FEE: 0.07, 
    
    // Withdrawal Presets
    WITHDRAWAL_PRESETS: [1000, 2500, 10000, 27000, 45000, 72000, 112000, 250000],

    // Daily Tasks (Fixed total count)
    TOTAL_DAILY_TASKS: 3,

    // ============================
    // 3. SYSTEM & STORAGE SETTINGS
    // ============================
    
    // LocalStorage Keys (Used for state management/caching)
    STORAGE: {
        USER_DATA: "cf_user_data_cache",
        PIN_SET: "cf_pin_set",
    },

    // Referral Link Base (User's UID is appended)
    REF_LINK_BASE: "https://cashforge.app/register.html?ref=",
    
    // Admin Wallet for Deposits (TRC20) - MOCK
    ADMIN_WALLET: "TVJ5... (Update with Real Address)", 

    // ============================
    // 4. BUSINESS LOGIC TABLES (Section 3 & 4)
    // NOTE: Data is fetched live from Supabase; these are client-side structures for context/logic.
    // ============================

    // PRO TRADING Tiers (Total ROI is used for calculations in finance.js)
    PRO_TRADES: [
        { name: "Day Trading",     min: 3000,   max: 80000,    duration: '24 Hours', roi: 0.030 }, // 3.0%
        { name: "Weekly Booster",  min: 15000,  max: 250000,   duration: '7 Days',   roi: 0.250 }, // 25.0%
        { name: "Monthly Mega",    min: 250000, max: 1000000,  duration: '30 Days',  roi: 3.500 }  // 350.0%
    ],

    // COMMISSION RATES (Used in team.js)
    COMMISSION_RATES: [
        { range: 'Basic - Advanced',  A: 0.15, B: 0.05, C: 0.02 },
        { range: 'Pro - Supreme',     A: 0.20, B: 0.07, C: 0.05 },
        { range: 'Elite - Ultimate',  A: 0.25, B: 0.10, C: 0.05 }
    ],

    // VIP SALARY Tiers
    SALARY_TIERS: [
        { level: 6, req: 6,    count_logic: 'A Only',  amount: 8000  },
        { level: 5, req: 15,   count_logic: 'A Only',  amount: 25000 },
        { level: 4, req: 100,  count_logic: 'A+B+C',   amount: 100000},
        { level: 3, req: 500,  count_logic: 'A+B+C',   amount: 300000},
        { level: 2, req: 1000, count_logic: 'A+B+C',   amount: 800000},
        { level: 1, req: 2000, count_logic: 'A+B+C',   amount: 2000000},
    ],

    // ============================
    // 5. UTILITY FUNCTIONS
    // ============================
    
    // Format numbers with commas (e.g., 1,000.00)
    formatCurrency: function(amount) {
        if (amount === undefined || amount === null) return '0.00';
        return parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    // Format numbers without decimals (for counts)
    formatCount: function(amount) {
         if (amount === undefined || amount === null) return 0;
        return parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
};

// Freeze object to prevent accidental modifications during runtime
Object.freeze(CONFIG);
