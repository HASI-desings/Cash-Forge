/* js/controllers/tasks.js */
import { supabase } from '../config/supabase.js';
import { getCurrentUser } from '../services/auth.js';
import { formatCurrency, formatDateTime } from '../utils/formatters.js';
import { showToast } from '../utils/ui.js';

const TasksController = {
    currentUser: null,
    dailyLimit: 3,
    tasksDone: 0,
    isTaskRunning: false,
    
    // --- 1. INITIALIZE ---
    async init() {
        // Check Session
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            window.location.href = 'login.html';
            return;
        }

        // Get fresh profile data (balance/vip)
        await this.loadProfile(sessionUser.id);
        
        // Update Balance Header
        if(this.currentUser) {
            const balEl = document.getElementById('task-balance');
            if(balEl) balEl.innerText = formatCurrency(this.currentUser.balance);
        }

        // A. Check Logic (Locked vs Unlocked)
        await this.checkUnlockStatus();
    },

    async loadProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error) throw error;
            this.currentUser = data;
        } catch (err) {
            console.error(err);
        }
    },

    // --- 2. CHECK STATUS (Lock/Unlock) ---
    async checkUnlockStatus() {
        const viewLocked = document.getElementById('view-locked');
        const viewActive = document.getElementById('view-active');
        if (!viewLocked || !viewActive) return;

        // Rule: User needs VIP Level > 0 OR an active investment to perform tasks
        let isUnlocked = this.currentUser.vip_level > 0;

        if (!isUnlocked) {
            // Double check investments table
            const { data } = await supabase
                .from('investments')
                .select('id')
                .eq('user_id', this.currentUser.id)
                .eq('status', 'active')
                .limit(1);
            
            if (data && data.length > 0) isUnlocked = true;
        }

        if (isUnlocked) {
            viewLocked.style.display = 'none';
            viewActive.style.display = 'block'; // Or flex, depending on CSS
            
            // If unlocked, calculate how many tasks left
            this.calculateDailyProgress();
        } else {
            viewLocked.style.display = 'flex';
            viewActive.style.display = 'none';
        }
    },

    // --- 3. CALCULATE DAILY PROGRESS ---
    async calculateDailyProgress() {
        // Count transactions of type 'task_reward' created TODAY
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);

        const { data, error } = await supabase
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
            showToast("Daily limit reached! Come back tomorrow.", "error");
            return;
        }

        // UI State: Running
        this.isTaskRunning = true;
        const btnStart = document.getElementById('btn-start-task');
        const loader = document.getElementById('task-loader');
        const illustration = document.getElementById('task-illustration'); // If exists
        const statusText = document.getElementById('task-status-text');
        const timerDisplay = document.querySelector('.timer-display'); // Assuming class from HTML

        if(btnStart) btnStart.style.display = 'none';
        if(illustration) illustration.style.display = 'none';
        if(loader) {
            loader.style.display = 'block';
            loader.classList.add('loader-active');
        }
        
        if(statusText) statusText.style.color = "#008b8b";
        
        // TIMER: 75 Seconds
        let timeLeft = 75; 

        const timer = setInterval(() => {
            timeLeft--;
            
            // Update Timer UI
            if(statusText) statusText.innerText = `Analyzing Market Data...`;
            if(timerDisplay) timerDisplay.innerText = `00:${timeLeft < 10 ? '0'+timeLeft : timeLeft}`;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.completeTask();
            }
        }, 1000);
    },

    // --- 5. COMPLETE TASK (Backend Update) ---
    async completeTask() {
        try {
            // Reward Logic: Random between 10 and 50 PKR (Example)
            const min = 10; 
            const max = 50;
            const reward = (Math.random() * (max - min) + min).toFixed(2);
            const rewardNum = parseFloat(reward);

            // A. Update Balance
            const newBalance = parseFloat(this.currentUser.balance) + rewardNum;
            const { error: balError } = await supabase
                .from('users')
                .update({ balance: newBalance })
                .eq('id', this.currentUser.id);
            
            if (balError) throw balError;

            // B. Insert Transaction
            const { error: txError } = await supabase
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
            
            const balEl = document.getElementById('task-balance');
            if(balEl) balEl.innerText = formatCurrency(newBalance);
            
            showToast(`Task Complete! Earned ${reward} PKR`, "success");

            // Refresh UI
            this.calculateDailyProgress();
            
            // Reset Visuals
            const loader = document.getElementById('task-loader');
            const illustration = document.getElementById('task-illustration');
            const statusText = document.getElementById('task-status-text');
            const btnStart = document.getElementById('btn-start-task');
            const timerDisplay = document.querySelector('.timer-display');

            if(loader) {
                loader.classList.remove('loader-active');
                loader.style.display = 'none';
            }
            if(illustration) illustration.style.display = 'block';
            if(statusText) statusText.innerText = "Task Completed";
            if(timerDisplay) timerDisplay.innerText = "00:75"; // Reset to default
            
            // Show button again if tasks remain
            if (this.tasksDone < this.dailyLimit) {
                setTimeout(() => {
                    if(btnStart) btnStart.style.display = 'block';
                    if(statusText) statusText.innerText = "Ready for next task";
                }, 2000);
            } else {
                if(statusText) {
                    statusText.innerText = "Daily Quota Finished";
                    statusText.style.color = "#2ecc71";
                }
            }

        } catch (err) {
            console.error(err);
            showToast("Network error. Reward not saved.", "error");
            this.isTaskRunning = false;
        }
    },

    // --- 6. UI HELPERS ---
    updateUI() {
        const remaining = this.dailyLimit - this.tasksDone;
        const leftEl = document.getElementById('tasks-left');
        if(leftEl) leftEl.innerText = (remaining > 0 ? remaining : 0);
        
        const btn = document.getElementById('btn-start-task');
        const status = document.getElementById('task-status-text');

        if (remaining <= 0) {
            if(btn) btn.style.display = 'none';
            if(status) {
                status.innerText = "All tasks completed for today.";
                status.style.color = "#2ecc71";
            }
        }
    },

    renderHistory(txns) {
        const container = document.getElementById('log-container');
        if(!container) return;

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
            div.className = 'log-item'; // Ensure CSS exists for this
            div.style.padding = "10px";
            div.style.borderBottom = "1px solid #eee";
            div.style.display = "flex";
            div.style.justifyContent = "space-between";
            div.style.fontSize = "0.9rem";
            
            div.innerHTML = `
                <span>Task #${index + 1} - ${formatDateTime(txn.created_at).split(',')[1]}</span>
                <span style="color:var(--success-green); font-weight:600;">+${parseFloat(txn.amount).toFixed(2)} PKR</span>
            `;
            container.prepend(div); // Newest on top
        });

        // Optional: Show total in the header of log
        const header = container.previousElementSibling; // The <h4>
        if(header) header.innerHTML = `Today's Income <span style="float:right; color:#2ecc71;">+${totalToday.toFixed(2)} PKR</span>`;
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    TasksController.init();
    
    // Attach Global Function for HTML onclick="startTask()"
    window.startTask = () => TasksController.startTask();
});
