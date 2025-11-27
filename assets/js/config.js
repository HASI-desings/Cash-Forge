/**
 * 💎 CASHFORGE CONFIGURATION
 * The Single Source of Truth for application rules and constants.
 */

export const CONFIG = {
    // --- GLOBAL ECONOMY ---
    ECONOMY: {
        INITIAL_BALANCE: 0,         // Real app starts at 0
        USDT_PKR_RATE: 285,         // 1 USDT = 285 PKR
        WITHDRAWAL_FEE: 0.07,       // 7% Fee
        MIN_WITHDRAWAL: 1000,       // Matches lowest preset
        MIN_DEPOSIT: 500,           // Minimum deposit allowed
        CURRENCY_SYMBOL: '₨',
        PACKAGE_DURATION_DAYS: 365  // Validity of investments
    },

    // --- WALLET ADDRESSES (For Deposits) ---
    WALLETS: {
        TRC20: "TAjyw8fVP8dkXJjqFE3vNMBWGaNz5sRbeG",
        BEP20: "0x216c7d58c3F07428D3c1Be3762F402f71b43Eb56"
    },

    // --- WITHDRAWAL PRESETS (Strict Rules) ---
    WITHDRAW_PRESETS: [
        1000, 
        2500, 
        10000, 
        27000, 
        45000, 
        72000, 
        112000, 
        250000
    ],

    // --- INVESTMENT PACKAGES (8 Tiers) ---
    PACKAGES: [
        { id: 1, name: 'Basic', investment: 900, daily: 35 },
        { id: 2, name: 'Standard', investment: 3900, daily: 135 },
        { id: 3, name: 'Advanced', investment: 8900, daily: 300 },
        { id: 4, name: 'Pro', investment: 18500, daily: 620 },
        { id: 5, name: 'Premium', investment: 32500, daily: 1100 },
        { id: 6, name: 'Supreme', investment: 54900, daily: 2000 },
        { id: 7, name: 'Elite', investment: 112000, daily: 3900 },
        { id: 8, name: 'Ultimate', investment: 250000, daily: 8500 }
    ],

    // --- PRO TRADING TIERS ---
    // durationHours: How long funds are locked
    // percent: Total return percentage (e.g. 3 = 3% profit)
    TRADE_TIERS: {
        daily: {
            id: 'daily',
            name: 'Day Trading',
            min: 3000,
            max: 80000,
            durationHours: 24,
            percent: 3.0
        },
        weekly: {
            id: 'weekly',
            name: 'Weekly Booster',
            min: 15000,
            max: 250000,
            durationHours: 168, // 7 Days
            percent: 25.0
        },
        monthly: {
            id: 'monthly',
            name: 'Monthly Mega',
            min: 250000,
            max: 1000000,
            durationHours: 720, // 30 Days
            percent: 350.0
        }
    },

    // --- VIP SALARY TIERS (Affiliate System) ---
    VIP_LEVELS: [
        { level: 5, required: 50, salary: 12000 },
        { level: 4, required: 180, salary: 50000 },
        { level: 3, required: 300, salary: 120000 },
        { level: 2, required: 500, salary: 480000 },
        { level: 1, required: 1500, salary: 1000000 }
    ],

    // --- SYSTEM MESSAGES ---
    MESSAGES: {
        WEEKEND_LOCK: "Trading markets are closed on weekends (Sat-Sun).",
        INSUFFICIENT_FUNDS: "Insufficient Balance.",
        TASK_FAIL: "Task Failed! Do not leave the app while working.",
        SUCCESS_DEPOSIT: "Deposit Submitted! Waiting for blockchain confirmation.",
        SUCCESS_WITHDRAW: "Withdrawal Requested Successfully!"
    }
};