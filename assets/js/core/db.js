/**
 * CashForge Database Abstraction Layer
 * Handles all interactions with localStorage to simulate a backend.
 */

const DB = {
    
    // =================================
    // 1. INITIALIZATION
    // =================================
    init: function() {
        if (!localStorage.getItem(CONFIG.STORAGE.USER_DATA)) {
            const initialUser = {
                uid: "UID-" + Math.floor(100000 + Math.random() * 900000),
                name: "New Member",
                email: "",
                balance: 0,
                vipLevel: 0,
                teamCount: 0,
                totalIncome: 0,
                pin: null,
                joinedDate: new Date().toISOString().split('T')[0]
            };
            this.saveUser(initialUser);
            console.log("DB: New User Initialized");
        }

        if (!localStorage.getItem('cf_transactions')) {
            localStorage.setItem('cf_transactions', JSON.stringify([]));
        }

        if (!localStorage.getItem('cf_my_plans')) {
            localStorage.setItem('cf_my_plans', JSON.stringify([]));
        }
    },

    // =================================
    // 2. USER MANAGEMENT
    // =================================
    getUser: function() {
        return JSON.parse(localStorage.getItem(CONFIG.STORAGE.USER_DATA));
    },

    saveUser: function(user) {
        localStorage.setItem(CONFIG.STORAGE.USER_DATA, JSON.stringify(user));
        // Update header balance if it exists in DOM
        this.updateUIBalance();
    },

    // Add funds (Deposit/Profit)
    addBalance: function(amount) {
        const user = this.getUser();
        user.balance += parseFloat(amount);
        user.totalIncome += parseFloat(amount);
        this.saveUser(user);
        return user.balance;
    },

    // Deduct funds (Withdraw/Invest)
    deductBalance: function(amount) {
        const user = this.getUser();
        if (user.balance < amount) return false; // Insufficient funds
        
        user.balance -= parseFloat(amount);
        this.saveUser(user);
        return true;
    },

    // Update UI Balance everywhere
    updateUIBalance: function() {
        const user = this.getUser();
        if (!user) return;

        // IDs used in various files
        const targets = ['header-balance', 'wallet-balance', 'main-balance'];
        
        targets.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = CONFIG.formatCurrency(user.balance);
        });
    },

    // =================================
    // 3. INVESTMENT PLANS
    // =================================
    getMyPlans: function() {
        return JSON.parse(localStorage.getItem('cf_my_plans') || "[]");
    },

    buyPlan: function(planId) {
        // Find plan details from Config
        const planDetails = CONFIG.PLANS.find(p => p.id === planId);
        if (!planDetails) return { success: false, msg: "Invalid Plan" };

        // Check Balance
        if (!this.deductBalance(planDetails.price)) {
            return { success: false, msg: "Insufficient Balance" };
        }

        // Save Investment
        const myPlans = this.getMyPlans();
        const newInvestment = {
            instanceId: Date.now(),
            planId: planDetails.id,
            name: planDetails.name,
            invested: planDetails.price,
            daily: planDetails.daily,
            startDate: new Date().toISOString().split('T')[0],
            daysRun: 0,
            totalDays: planDetails.days,
            active: true
        };

        myPlans.push(newInvestment);
        localStorage.setItem('cf_my_plans', JSON.stringify(myPlans));

        // Create Transaction Record
        this.addTransaction({
            type: 'investment',
            amount: planDetails.price,
            desc: `Purchased ${planDetails.name}`,
            status: 'success'
        });

        return { success: true, msg: "Plan Activated Successfully" };
    },

    // =================================
    // 4. TRANSACTIONS
    // =================================
    getTransactions: function() {
        return JSON.parse(localStorage.getItem('cf_transactions') || "[]").reverse(); // Newest first
    },

    addTransaction: function(data) {
        // data: { type: 'deposit'|'withdraw'|'investment'|'income', amount, desc, status }
        const txns = JSON.parse(localStorage.getItem('cf_transactions') || "[]");
        
        const newTxn = {
            id: "TXN" + Math.floor(Date.now() / 1000),
            date: new Date().toLocaleString(),
            ...data
        };

        txns.push(newTxn);
        localStorage.setItem('cf_transactions', JSON.stringify(txns));
    },

    // =================================
    // 5. TASK LOGIC (Daily Reset)
    // =================================
    getTaskProgress: function() {
        const today = new Date().toISOString().split('T')[0];
        let progress = JSON.parse(localStorage.getItem('cf_task_progress'));

        // Reset if new day
        if (!progress || progress.date !== today) {
            progress = { date: today, count: 0, claimed: false };
            localStorage.setItem('cf_task_progress', JSON.stringify(progress));
        }
        return progress;
    },

    completeTask: function() {
        const p = this.getTaskProgress();
        if (p.count < 3) {
            p.count++;
            localStorage.setItem('cf_task_progress', JSON.stringify(p));
            return true;
        }
        return false;
    },

    claimDailyReward: function(amount) {
        const p = this.getTaskProgress();
        if (p.count >= 3 && !p.claimed) {
            this.addBalance(amount);
            p.claimed = true;
            localStorage.setItem('cf_task_progress', JSON.stringify(p));
            
            this.addTransaction({
                type: 'income',
                amount: amount,
                desc: "Daily Task Reward",
                status: 'success'
            });
            return true;
        }
        return false;
    }
};

// Initialize on load
DB.init();