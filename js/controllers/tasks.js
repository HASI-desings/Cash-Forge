/* Tasks Controller - CashForge
   Handles the Daily Task logic:
   1. Checks if user is VIP (Invested) -> Unlocks View.
   2. Counts tasks completed today via Transaction history.
   3. Runs the 75-second Timer.
   4. Pays reward directly to Supabase.
*/

const TasksController = {
    currentUser: null,
    dailyLimit: 3,
    tasksDone: 0,
    isTaskRunning: false,
    
    // --- 1. INITIALIZE ---
    async init() {
        const sessionUser = await AuthService.checkSession();
        if (!sessionUser) return;

        this.currentUser = await AuthService.getProfile();
        
        // Update Balance Header
        if(this.currentUser) {
            document.getElementById('task-balance').innerText = Formatters.currency(this.currentUser.balance);
        }

        // A. Check Logic (Locked vs Unlocked)
        await this.checkUnlockStatus();
    },

    // --- 2. CHECK STATUS (Lock/Unlock) ---
    async checkUnlockStatus() {
        const viewLocked = document.getElementById('view-locked');
        const viewActive = document.getElementById('view-active');

        // Rule: User needs VIP Level > 0 OR an active investment to perform tasks
        // We can check the 'vip_level' from profile, or query 'investments' table.
        // Let's use vip_level for speed if it was updated by trigger, 
        // otherwise let's query investments table to be safe.
        
        let isUnlocked = this.currentUser.vip_level > 0;

        if (!isUnlocked) {
            // Double check investments table just in case
            const { data } = await window.sb
                .from('investments')
                .select('id')
                .eq('user_id', this.currentUser.id)
                .eq('status', 'active')
                .limit(1);
            
            if (data && data.length > 0) isUnlocked = true;
        }

        if (isUnlocked) {
            viewLocked.style.display = 'none';
            viewActive.style.display = 'flex'; // Changed to Flex to match CSS
            
            // If unlocked, calculate how many tasks left
            this.calculateDailyProgress();
        } else {
            viewLocked.style.display = 'flex';
            viewActive.style.display = 'none';
        }
    },

    // --- 3. CALCULATE DAILY PROGRESS ---
    async calculateDailyProgress() {
        // We count transactions of type 'task_reward' created TODAY
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);

        const { data, error } = await window.sb
            .from('transactions')
            .select('id, amount, created_at')
            .eq('user_id', this.currentUser.id)
            .eq('type', 'task_reward')
            .gte('created_at', startOfDay.toISOString());

        if (data) {
            this.tasksDone = data.length;
            this.renderHistory(data);
        }
        
        this.updateUI();
    },

    // --- 4. START TASK LOGIC ---
    startTask() {
        if (this.isTaskRunning) return;
        if (this.tasksDone >= this.dailyLimit) {
            UI.toast("Daily limit reached! Come back tomorrow.", "error");
            return;
        }

        // UI State: Running
        this.isTaskRunning = true;
        const btnStart = document.getElementById('btn-start-task');
        const loader = document.getElementById('task-loader');
        const illustration = document.getElementById('task-illustration');
        const statusText = document.getElementById('task-status-text');

        btnStart.style.display = 'none';
        illustration.style.display = 'none';
        loader.style.display = 'block';
        loader.classList.add('loader-active');
        
        statusText.style.color = "#008b8b";
        
        // TIMER: 75 Seconds
        let timeLeft = 75; 
        // For testing, you can change 75 to 5 below:
        // let timeLeft = 5; 

        const timer = setInterval(() => {
            timeLeft--;
            statusText.innerText = `Analyzing Market Data... ${timeLeft}s`;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.completeTask();
            }
        }, 1000);
    },

    // --- 5. COMPLETE TASK (Backend Update) ---
    async completeTask() {
        try {
            // Reward Logic: Random between 0.50 and 1.50 USDT (Example)
            const reward = (Math.random() * (1.50 - 0.50) + 0.50).toFixed(2);
            const rewardNum = parseFloat(reward);

            // A. Update Balance
            const newBalance = parseFloat(this.currentUser.balance) + rewardNum;
            const { error: balError } = await window.sb
                .from('users')
                .update({ balance: newBalance })
                .eq('id', this.currentUser.id);
            
            if (balError) throw balError;

            // B. Insert Transaction
            const { error: txError } = await window.sb
                .from('transactions')
                .insert([{
                    user_id: this.currentUser.id,
                    type: 'task_reward',
                    amount: rewardNum,
                    status: 'completed',
                    wallet_address: 'System Reward'
                }]);

            if (txError) throw txError;

            // C. Success UI
            this.currentUser.balance = newBalance; // Update local state
            this.tasksDone++;
            this.isTaskRunning = false;
            
            document.getElementById('task-balance').innerText = Formatters.currency(newBalance);
            UI.toast(`Task Complete! Earned ${reward} USDT`, "success");

            // Refresh UI
            this.calculateDailyProgress();
            
            // Reset Visuals
            const loader = document.getElementById('task-loader');
            const illustration = document.getElementById('task-illustration');
            const statusText = document.getElementById('task-status-text');
            const btnStart = document.getElementById('btn-start-task');

            loader.classList.remove('loader-active');
            loader.style.display = 'none';
            illustration.style.display = 'block';
            statusText.innerText = "Task Completed";
            
            // Show button again if tasks remain
            if (this.tasksDone < this.dailyLimit) {
                setTimeout(() => {
                    btnStart.style.display = 'block';
                    statusText.innerText = "Ready for next task";
                }, 2000);
            } else {
                statusText.innerText = "Daily Quota Finished";
                statusText.style.color = "#2ecc71";
            }

        } catch (err) {
            console.error(err);
            UI.toast("Network error. Reward not saved.", "error");
            this.isTaskRunning = false;
        }
    },

    // --- 6. UI HELPERS ---
    updateUI() {
        const remaining = this.dailyLimit - this.tasksDone;
        document.getElementById('tasks-left').innerText = (remaining > 0 ? remaining : 0);
        
        const btn = document.getElementById('btn-start-task');
        const status = document.getElementById('task-status-text');

        if (remaining <= 0) {
            btn.style.display = 'none';
            status.innerText = "All tasks completed for today.";
            status.style.color = "#2ecc71";
        }
    },

    renderHistory(txns) {
        const container = document.getElementById('log-container');
        if (!txns || txns.length === 0) {
            container.innerHTML = '<p style="font-size:11px; color:#999; text-align:center;">No tasks completed today.</p>';
            return;
        }

        container.innerHTML = '';
        // Calculate Total earned today
        let totalToday = 0;

        txns.forEach((txn, index) => {
            totalToday += parseFloat(txn.amount);
            const div = document.createElement('div');
            div.className = 'log-item';
            div.innerHTML = `
                <span>Task #${index + 1} - ${Formatters.dateTime(txn.created_at).split(',')[1]}</span>
                <span class="log-amount">+${parseFloat(txn.amount).toFixed(2)} USDT</span>
            `;
            container.prepend(div); // Newest on top
        });

        // Optional: Show total in the header of log
        const header = container.previousElementSibling; // The <h4>
        if(header) header.innerHTML = `Today's Income <span style="float:right; color:#2ecc71;">+${totalToday.toFixed(2)}</span>`;
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    TasksController.init();
    
    // Attach Global Function
    window.startTask = () => TasksController.startTask();
});