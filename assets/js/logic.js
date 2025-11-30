/**
 * 🧠 CASHFORGE LOGIC ENGINE
 */

import { CONFIG } from './config.js';

export const Logic = {
    
    // --- 1. TIME & DATE RULES ---
    // Removed strict weekend lock. Now we check specific package days.
    
    formatDate: (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    },

    // --- 2. WITHDRAWAL DAY CHECKER ---
    checkWithdrawalEligibility: (userPackageId) => {
        const todayIndex = new Date().getDay(); // 0=Sun, 1=Mon ... 6=Sat
        
        // If user has no package, they generally can't withdraw or default to Monday?
        // Let's assume "No Package" = Locked
        if (!userPackageId || userPackageId === 0) {
            return { allowed: false, reason: "You must purchase a package to withdraw." };
        }

        const pkg = CONFIG.PACKAGES.find(p => p.id === userPackageId);
        if (!pkg) return { allowed: false, reason: "Invalid Package." };

        if (todayIndex !== pkg.withdrawDay) {
            return { 
                allowed: false, 
                reason: `Your ${pkg.name} Plan only allows withdrawals on ${pkg.dayName}.` 
            };
        }

        return { allowed: true };
    },

    // --- 3. INVESTMENT CALCULATIONS ---
    calculateTradeReturn: (amount, tierId) => {
        const tier = CONFIG.TRADE_TIERS[tierId];
        if (!tier) return 0;
        const profit = amount * (tier.dailyPercent / 100) * tier.durationDays; // Total Profit
        return {
            profit: profit,
            total: amount + profit,
            durationMs: tier.durationDays * 24 * 60 * 60 * 1000
        };
    },

    calculateUpgradeCost: (targetPackageId, currentPackageId) => {
        const target = CONFIG.PACKAGES.find(p => p.id === targetPackageId);
        const current = CONFIG.PACKAGES.find(p => p.id === currentPackageId);
        if (!target) return null;
        
        let cost = target.investment;
        let credit = 0;
        if (current && current.id < target.id) {
            credit = current.investment;
            cost = Math.max(0, target.investment - credit);
        }
        return { finalCost: cost, creditApplied: credit };
    },

    // --- 4. TASK RANDOMIZER ---
    generateDailyTasks: (packageId) => {
        const pkg = CONFIG.PACKAGES.find(p => p.id === packageId);
        if (!pkg) return []; // No package = No tasks

        const totalIncome = pkg.daily;
        const totalTime = 75; 

        let t1 = Math.floor(Math.random() * (30 - 20 + 1) + 20);
        let t2 = Math.floor(Math.random() * (30 - 20 + 1) + 20);
        let t3 = totalTime - t1 - t2;

        const tasks = [
            { id: 1, title: "Market Analysis", duration: t1 },
            { id: 2, title: "Portfolio Audit", duration: t2 },
            { id: 3, title: "Smart Contract Execution", duration: t3 }
        ];

        return tasks.map(t => ({
            ...t,
            reward: (t.duration / totalTime) * totalIncome
        }));
    },

    // --- 5. VALIDATORS ---
    validateWithdrawal: (amount, balance, userPin, userPackageId) => {
        if (!amount || isNaN(amount)) return { valid: false, msg: "Invalid amount" };
        if (amount > balance) return { valid: false, msg: CONFIG.MESSAGES.INSUFFICIENT_FUNDS };
        if (!userPin) return { valid: false, msg: "Security PIN not set" };
        
        if (!CONFIG.WITHDRAW_PRESETS.includes(amount)) {
            return { valid: false, msg: "Amount must be a standard preset" };
        }

        // Day Check
        const eligibility = Logic.checkWithdrawalEligibility(userPackageId);
        if (!eligibility.allowed) {
            return { valid: false, msg: eligibility.reason };
        }

        return { valid: true };
    },

    validateDeposit: (amountPKR) => {
        if (amountPKR < CONFIG.ECONOMY.MIN_DEPOSIT) {
            return { valid: false, msg: `Minimum deposit is ${CONFIG.ECONOMY.CURRENCY_SYMBOL} ${CONFIG.ECONOMY.MIN_DEPOSIT}` };
        }
        return { valid: true };
    },

    calculateVipProgress: (referralCount) => {
        const nextLevel = CONFIG.VIP_LEVELS.find(l => l.required > referralCount);
        const currentLevel = CONFIG.VIP_LEVELS.slice().reverse().find(l => l.required <= referralCount);
        if (!nextLevel) return { percent: 100, current: 5, next: null }; 
        const percent = Math.min(100, (referralCount / nextLevel.required) * 100);
        return { percent: percent, current: currentLevel ? currentLevel.level : 0, next: nextLevel };
    }
};
