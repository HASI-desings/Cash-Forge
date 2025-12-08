/**
 * CashForge Finance Manager
 * Handles all core business logic, calculations, and financial simulations.
 * Dependencies: config.js, db.js, state.js
 */

const FinanceManager = {
    
    // =================================
    // 1. DEPOSIT/WITHDRAWAL CALCULATIONS
    // =================================

    /**
     * Converts PKR to USDT using the configured exchange rate.
     * @param {number} pkrAmount - Amount in Pakistani Rupees.
     * @returns {number} - Equivalent amount in USDT (2 decimal places).
     */
    calculateDeposit: function(pkrAmount) {
        if (pkrAmount <= 0) return 0;
        const usdt = pkrAmount / CONFIG.EXCHANGE_RATE;
        return parseFloat(usdt.toFixed(2));
    },

    /**
     * Calculates the withdrawal fee and the final amount received.
     * @param {number} pkrAmount - Requested amount in PKR.
     * @returns {object} - { fee: number, netReceived: number }
     */
    calculateWithdrawal: function(pkrAmount) {
        if (pkrAmount <= 0) return { fee: 0, netReceived: 0 };
        
        const fee = Math.floor(pkrAmount * CONFIG.WITHDRAWAL_FEE);
        const netReceived = pkrAmount - fee;
        
        return {
            fee: fee,
            netReceived: netReceived
        };
    },

    // =================================
    // 2. INVESTMENT LOGIC
    // =================================

    /**
     * Attempts to purchase an investment plan.
     * @param {number} planId - The ID of the plan to purchase.
     * @returns {object} - { success: boolean, msg: string }
     */
    purchaseInvestment: function(planId) {
        return DB.buyPlan(planId);
    },

    /**
     * Calculates the total guaranteed daily income from all active plans.
     * @returns {number} - Total daily PKR yield.
     */
    calculateDailyYield: function() {
        const activePlans = DB.getMyPlans();
        if (!activePlans || activePlans.length === 0) return 0;

        const totalYield = activePlans.reduce((sum, plan) => sum + plan.daily, 0);
        
        // This value should be used by tasks-dashboard.html
        State.update('dailyYield', totalYield);
        return totalYield;
    },

    /**
     * Simulates the daily profit accumulation based on time elapsed.
     * NOTE: This function would typically run on a backend cron job, 
     * but here it's run on app load to simulate passage of time.
     */
    simulateDailyProfit: function() {
        // Find how much profit should be generated based on time difference (simplistic mock)
        
        // 1. Get total daily yield
        const yieldAmount = this.calculateDailyYield();
        
        // 2. Check if the user is eligible to claim today's reward (Tasks logic)
        const taskProgress = DB.getTaskProgress();

        // Check if user has claimed today's rewards already
        if (taskProgress.claimed) {
            console.log("Finance: Daily profit already claimed.");
            return;
        }

        // If tasks are complete, the reward is available to claim on tasks-dashboard.html
        if (taskProgress.count >= 3) {
            console.log(`Finance: ${CONFIG.CURRENCY_SYMBOL}${yieldAmount} ready to claim.`);
        } else {
            console.log("Finance: Tasks incomplete. Profit generation pending.");
        }
    }
};

// Run simulation check on load
FinanceManager.simulateDailyProfit();

// Make finance manager methods globally accessible
Object.freeze(FinanceManager);