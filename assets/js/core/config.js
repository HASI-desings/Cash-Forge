/**
 * CashForge Configuration File (Supabase Ready)
 * Central source of truth for app settings, constants, and business logic tables.
 */

const CONFIG = {
    // ============================
    // 1. APP IDENTITY & GLOBALS
    // ============================
    APP_NAME: "CashForge",
    VERSION: "1.0.0",
    
    // Financial Identity
    CURRENCY_CODE: "PKR",
    CURRENCY_SYMBOL: "Rs",

    // ============================
    // 2. FINANCIAL THRESHOLDS (Section 1)
    // ============================
    // Exchange Rate: 1 USDT = 285 PKR
    EXCHANGE_RATE: 285, 
    
    // Minimum/Maximums
    MIN_DEPOSIT: 500,
    MIN_WITHDRAWAL: 1000,
    
    // Withdrawal Fee: 7%
    WITHDRAWAL_FEE: 0.07, 
    
    // Withdrawal Presets
    WITHDRAWAL_PRESETS: [1000, 2500, 10000, 27000, 45000, 72000, 112000, 250000],

    // Daily Tasks
    TOTAL_DAILY_TASKS: 3,

    // ============================
    // 3. STORAGE & SYSTEM SETTINGS
    // ============================
    
    // LocalStorage Keys (Prevents typos)
    STORAGE: {
        TOKEN: "cf_session_token",
        USER_DATA: "cf_user_data",
        PIN_SET: "cf_pin_set",
    },

    // Referral Link Base (Requires User's UID/Referral Code appended)
    REF_LINK_BASE: "https://cashforge.app/register.html?ref=",
    
    // Admin Wallet for Deposits (TRC20) - MOCK
    ADMIN_WALLET: "TVJ5... (Update with Real Address)", 

    // ============================
    // 4. BUSINESS LOGIC TABLES
    // Note: These arrays will serve as client-side fallback/context.
    // The *live* data will be fetched from Supabase tables by DB.js.
    // ============================
    
    // Investment Packages (Section 2)
    PLANS: [
        { id: 1, name: "Basic",     price: 900,     daily: 35,    days: 365, vip: 1 },
        { id: 2, name: "Standard",  price: 3900,    daily: 135,   days: 365, vip: 2 },
        { id: 3, name: "Advanced",  price: 8900,    daily: 300,   days: 365, vip: 3 },
        { id: 4, name: "Pro",       price: 18500,   daily: 620,   days: 365, vip: 4 },
        { id: 5, name: "Premium",   price: 32500,   daily: 1100,  days: 365, vip: 5 },
        { id: 6, name: "Supreme",   price: 54900,   daily: 2000,  days: 365, vip: 6 },
        { id: 7, name: "Elite",     price: 112000,  daily: 3900,  days: 365, vip: 7 },
        { id: 8, name: "Ultimate",  price: 250000,  daily: 8500,  days: 365, vip: 8 }
    ],
    
    // PRO TRADING Tiers (Section 3)
    PRO_TRADES: [
        { name: "Day Trading",     min: 3000,   max: 80000,    duration: '24 Hours', roi: 0.030 }, // 3.0%
        { name: "Weekly Booster",  min: 15000,  max: 250000,   duration: '7 Days',   roi: 0.250 }, // 25.0%
        { name: "Monthly Mega",    min: 250000, max: 1000000,  duration: '30 Days',  roi: 3.500 }  // 350.0%
    ],

    // VIP SALARY Tiers (Section 5)
    SALARY_TIERS: [
        { level: 6, req: 6,    count_logic: 'A Only',  amount: 8000  },
        { level: 5, req: 15,   count_logic: 'A Only',  amount: 25000 },
        { level: 4, req: 100,  count_logic: 'A+B+C',   amount: 100000},
        { level: 3, req: 500,  count_logic: 'A+B+C',   amount: 300000},
        { level: 2, req: 1000, count_logic: 'A+B+C',   amount: 800000},
        { level: 1, req: 2000, count_logic: 'A+B+C',   amount: 2000000},
    ],
    
    // RECURRING COMMISSION RATES (Section 4B)
    COMMISSION_RATES: [
        { range: 'Basic - Advanced',  A: 0.15, B: 0.05, C: 0.02 },
        { range: 'Pro - Supreme',     A: 0.20, B: 0.07, C: 0.05 },
        { range: 'Elite - Ultimate',  A: 0.25, B: 0.10, C: 0.05 }
    ],

    // ============================
    // 5. UTILITY FUNCTIONS
    // ============================
    
    // Format numbers with commas (e.g., 1,000)
    formatCurrency: function(amount) {
        if (amount === undefined || amount === null) return '0';
        return parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    // Format numbers without decimals
    formatCount: function(amount) {
         if (amount === undefined || amount === null) return 0;
        return parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    },
    
    // Checks if today is Saturday (6) or Sunday (0)
    isWeekend: function() {
        const today = new Date().getDay(); 
        return today === 0 || today === 6;
    }
};

// Freeze object to prevent accidental modifications during runtime
Object.freeze(CONFIG);