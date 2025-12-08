/**
 * CashForge Finance Manager
 * Handles all core business logic, financial calculations, and profit simulations.
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
        // Apply exchange rate from CONFIG
        const usdt = pkrAmount / CONFIG.EXCHANGE_RATE;
        return parseFloat(usdt.toFixed(2));
    },

    /**
     * Calculates the withdrawal fee and the final net amount received.
     * @param {number} pkrAmount - Requested amount in PKR.
     * @returns {object} - { fee: number, netReceived: number }
     */
    calculateWithdrawal: function(pkrAmount) {
        if (pkrAmount <= 0) return { fee: 0, netReceived: 0 };
        
        // Apply fee percentage from CONFIG (7%)
        const fee = Math.floor(pkrAmount * CONFIG.WITHDRAWAL_FEE);
        const netReceived = pkrAmount - fee;
        
        return {
            fee: fee,
            netReceived: netReceived
        };
    },

    // =================================
    // 2. INVESTMENT LOGIC & CALCULATIONS
    // =================================

    /**
     * Calculates the total guaranteed daily income from all active investments.
     * @param {Array} activePlans - Array of active investment records from DB.
     * @returns {number} - Total daily PKR yield.
     */
    calculateDailyYield: function(activePlans) {
        if (!activePlans || activePlans.length === 0) return 0;

        // Sums the daily_income field from all active plan records
        const totalYield = activePlans.reduce((sum, plan) => sum + plan.daily_income, 0);
        
        return totalYield;
    },

    /**
     * Attempts to purchase an investment plan, handling deduction and record creation.
     * @param {number} planId - The ID of the static plan being purchased.
     * @returns {object} - { success: boolean, msg: string }
     */
    purchaseInvestment: async function(planId) {
        // 1. Fetch live plan details
        const allPlans = await DB.getPlansData(); 
        const planDetails = allPlans.find(p => p.id === planId);
        const user = await DB.getUser();

        if (!planDetails) return { success: false, msg: "Invalid Plan." };
        if (user.balance < planDetails.price) return { success: false, msg: "Insufficient Balance." };

        // 2. Deduct Balance and Log Transaction (Negative amount for deduction)
        const deductionResult = await DB.updateBalance(
            -planDetails.price, 
            'investment', 
            { plan_name: planDetails.name, investment_id: planId }
        ); 
        
        if (!deductionResult.success) {
            return { success: false, msg: "Transaction failed during deduction." };
        }

        // 3. Add Investment Record
        const investmentData = {
            plan_id: planDetails.id,
            plan_name: planDetails.name,
            invested_amount: planDetails.price,
            daily_income: planDetails.daily_income,
            duration_days: planDetails.duration_days,
            start_date: new Date().toISOString().split('T')[0],
            active: true
        };
        
        await DB.addInvestment(investmentData);
        
        // 4. Update state globally
        State.refresh();

        return { success: true, msg: "Plan Activated Successfully." };
    },

    // =================================
    // 3. DAILY PROFIT CLAIM LOGIC
    // =================================

    /**
     * Handles the final claim of task rewards and investment profit.
     * @returns {object} - { success: boolean, msg: string }
     */
    claimDailyReward: async function() {
        const totalYield = State.get('dailyYield');
        const taskProgress = await DB.getTaskProgress();

        if (totalYield <= 0) {
            return { success: false, msg: "No active investments for profit generation." };
        }
        if ((taskProgress.tasks_completed || 0) < CONFIG.TOTAL_DAILY_TASKS) {
            return { success: false, msg: "Complete all daily tasks before claiming." };
        }
        if (taskProgress.claimed) {
            return { success: false, msg: "Daily profit has already been claimed." };
        }

        // 1. Add profit to user balance
        const result = await DB.updateBalance(totalYield, 'profit', { source: 'daily_task_claim' });
        
        if (result.success) {
            // 2. Mark the daily task status as claimed in the DB
            await DB.claimDailyReward(totalYield);
            
            // 3. Update state globally
            State.refresh();
            
            return { success: true, msg: "Reward credited successfully." };
        }
        
        return { success: false, msg: "Failed to credit profit. DB error." };
    }
};

Object.freeze(FinanceManager);
