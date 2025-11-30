/**
 * 💎 CASHFORGE CONFIGURATION
 * The Single Source of Truth for application rules and constants.
 */

export const CONFIG = {
    // --- GLOBAL ECONOMY ---
    ECONOMY: {
        INITIAL_BALANCE: 0,         
        USDT_PKR_RATE: 285,         
        WITHDRAWAL_FEE: 0.07,       
        MIN_WITHDRAWAL: 1000,       
        MIN_DEPOSIT: 500,           
        CURRENCY_SYMBOL: 'Rs',
        PACKAGE_DURATION_DAYS: 365  
    },

    // --- WALLET ADDRESSES ---
    WALLETS: {
        TRC20: "TAjyw8fVP8dkXJjqFE3vNMBWGaNz5sRbeG",
        BEP20: "0x216c7d58c3F07428D3c1Be3762F402f71b43Eb56"
    },

    // --- WITHDRAWAL PRESETS ---
    WITHDRAW_PRESETS: [
        1000, 2500, 10000, 27000, 45000, 72000, 112000, 250000
    ],

    // --- INVESTMENT PACKAGES (With Specific Withdraw Days) ---
    // Day Codes: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    PACKAGES: [
        { id: 1, name: 'Basic', investment: 900, daily: 35, withdrawDay: 6, dayName: 'Saturday' },
        { id: 2, name: 'Standard', investment: 3900, daily: 135, withdrawDay: 6, dayName: 'Saturday' },
        { id: 3, name: 'Advanced', investment: 8900, daily: 300, withdrawDay: 5, dayName: 'Friday' },
        { id: 4, name: 'Pro', investment: 18500, daily: 620, withdrawDay: 4, dayName: 'Thursday' },
        { id: 5, name: 'Premium', investment: 32500, daily: 1100, withdrawDay: 3, dayName: 'Wednesday' },
        { id: 6, name: 'Supreme', investment: 54900, daily: 2000, withdrawDay: 2, dayName: 'Tuesday' },
        { id: 7, name: 'Elite', investment: 112000, daily: 3900, withdrawDay: 1, dayName: 'Monday' },
        { id: 8, name: 'Ultimate', investment: 250000, daily: 8500, withdrawDay: 1, dayName: 'Monday' }
    ],

    // --- PRO TRADING TIERS ---
    TRADE_TIERS: {
        weekly: { id: 'weekly', name: 'Weekly Booster', min: 3000, max: 50000, durationDays: 7, dailyPercent: 1.5 },
        turbo: { id: 'turbo', name: 'Ten-Day Turbo', min: 5000, max: 100000, durationDays: 10, dailyPercent: 1.7 },
        mega: { id: 'mega', name: 'Monthly Mega', min: 15000, max: 300000, durationDays: 35, dailyPercent: 1.9 },
        quant: { id: 'quant', name: 'Quarterly Quant', min: 100000, max: 1000000, durationDays: 120, dailyPercent: 3.0 },
        bull: { id: 'bull', name: 'Biannual Bull', min: 150000, max: 2000000, durationDays: 200, dailyPercent: 5.0 }
    },

    // --- VIP LEVELS ---
    VIP_LEVELS: [
        { level: 5, required: 50, salary: 12000 },
        { level: 4, required: 180, salary: 50000 },
        { level: 3, required: 300, salary: 120000 },
        { level: 2, required: 500, salary: 480000 },
        { level: 1, required: 1500, salary: 1000000 }
    ],

    MESSAGES: {
        INSUFFICIENT_FUNDS: "Insufficient Balance.",
        TASK_FAIL: "Task Failed! Do not leave the app while working.",
        SUCCESS_DEPOSIT: "Deposit Submitted! Waiting for blockchain confirmation.",
        SUCCESS_WITHDRAW: "Withdrawal Requested Successfully!"
    }
};
