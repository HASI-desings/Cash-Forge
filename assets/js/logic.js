/**
 * 🧠 CASHFORGE LOGIC ENGINE
 * Pure business logic. No DOM manipulation here.
 */

import { CONFIG } from './config.js';

export const Logic = {
    
    // --- 1. TIME & DATE RULES ---
    isWeekend: () => {
        const today = new Date().getDay(); // 0=Sun, 6=Sat
        return today === 0 || today === 6;
    },

    // Returns formatted date string "DD MMM YYYY"
    formatDate: (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    },

    // --- 2. INVESTMENT CALCULATIONS ---
    calculateTradeReturn: (amount, tierId) => {
        const tier = CONFIG.TRADE_TIERS[tierId];
        if (!tier) return 0;
        
        // Profit = Amount * (Percent / 100)
        const profit = amount * (tier.percent / 100);
        return {
            profit: profit,
            total: amount + profit,
            durationMs: tier.durationHours * 60 * 60 * 1000
        };
    },

    calculateUpgradeCost: (targetPackageId, currentPackageId) => {
        const target = CONFIG.PACKAGES.find(p => p.id === targetPackageId);
        const current = CONFIG.PACKAGES.find(p => p.id === currentPackageId);
        
        if (!target) return null;
        
        let cost = target.investment;
        let credit = 0;

        // If upgrading from a lower package, apply credit
        if (current && current.id < target.id) {
            credit = current.investment;
            cost = Math.max(0, target.investment - credit);
        }

        return { finalCost: cost, creditApplied: credit };
    },

    // --- 3. TASK RANDOMIZER ---
    // Generates 3 random tasks that sum up EXACTLY to the daily income
    generateDailyTasks: (packageId) => {
        const pkg = CONFIG.PACKAGES.find(p => p.id === packageId);
        if (!pkg) return [];

        const totalIncome = pkg.daily;
        const totalTime = 75; // Seconds

        // Randomize Time Splits (ensuring sum is 75)
        // Split roughly: 30%, 30%, 40% with variance
        let t1 = Math.floor(Math.random() * (30 - 20 + 1) + 20);
        let t2 = Math.floor(Math.random() * (30 - 20 + 1) + 20);
        let t3 = totalTime - t1 - t2;

        const tasks = [
            { id: 1, title: "Market Analysis", duration: t1 },
            { id: 2, title: "Portfolio Audit", duration: t2 },
            { id: 3, title: "Smart Contract Execution", duration: t3 }
        ];

        // Assign Reward proportional to Time
        // Reward = (Time / TotalTime) * TotalIncome
        return tasks.map(t => ({
            ...t,
            reward: (t.duration / totalTime) * totalIncome
        }));
    },

    // --- 4. VALIDATORS ---
    validateWithdrawal: (amount, balance, userPin) => {
        if (!amount || isNaN(amount)) return { valid: false, msg: "Invalid amount" };
        if (amount > balance) return { valid: false, msg: CONFIG.MESSAGES.INSUFFICIENT_FUNDS };
        if (!userPin) return { valid: false, msg: "Security PIN not set" };
        
        // Check Presets
        if (!CONFIG.WITHDRAW_PRESETS.includes(amount)) {
            return { valid: false, msg: "Amount must be a standard preset" };
        }

        // Check Weekend
        if (Logic.isWeekend()) return { valid: false, msg: CONFIG.MESSAGES.WEEKEND_LOCK };

        return { valid: true };
    },

    validateDeposit: (amountPKR) => {
        if (amountPKR < CONFIG.ECONOMY.MIN_DEPOSIT) {
            return { valid: false, msg: `Minimum deposit is ${CONFIG.ECONOMY.CURRENCY_SYMBOL} ${CONFIG.ECONOMY.MIN_DEPOSIT}` };
        }
        return { valid: true };
    },

    // --- 5. VIP PROGRESS ---
    calculateVipProgress: (referralCount) => {
        // Find next level
        const nextLevel = CONFIG.VIP_LEVELS.find(l => l.required > referralCount);
        const currentLevel = CONFIG.VIP_LEVELS.slice().reverse().find(l => l.required <= referralCount);
        
        if (!nextLevel) return { percent: 100, current: 5, next: null }; // Max level

        // Calculate simple percentage to next goal
        // (referrals / required) * 100
        const percent = Math.min(100, (referralCount / nextLevel.required) * 100);
        
        return {
            percent: percent,
            current: currentLevel ? currentLevel.level : 0,
            next: nextLevel
        };
    }
};