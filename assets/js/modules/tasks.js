/**
 * CashForge Task Manager
 * Handles logic for tasks-dashboard.html and task-execution.html pages.
 * Dependencies: config.js, db.js, state.js, finance.js
 */

const TaskManager = {
    TOTAL_TASKS: 3,
    
    // --- 1. DASHBOARD INITIALIZATION ---

    initDashboard: function() {
        const totalYield = FinanceManager.calculateDailyYield();
        const taskProgress = DB.getTaskProgress();
        
        // Update total yield display
        const totalDisplayEl = document.getElementById('total-display');
        if (totalDisplayEl) totalDisplayEl.innerText = CONFIG.formatCurrency(totalYield);

        // Render UI
        this.updateProgressCircle(taskProgress.count, totalYield);
        this.renderTasks(taskProgress.count, totalYield);
        this.updateClaimButton(taskProgress.count, taskProgress.claimed, totalYield);
    },

    // --- 2. PROGRESS & RENDERING ---

    updateProgressCircle: function(completedCount, totalYield) {
        const progressRing = document.getElementById('progress-ring');
        const progressText = document.getElementById('progress-text');
        const earnedDisplay = document.getElementById('earned-display');
        
        if (!progressRing || !progressText) return;

        const percent = (completedCount / this.TOTAL_TASKS) * 100;
        const earned = (completedCount / this.TOTAL_TASKS) * totalYield;
        
        progressRing.setAttribute('stroke-dasharray', `${percent}, 100`);
        progressText.innerText = `${completedCount}/${this.TOTAL_TASKS}`;
        if (earnedDisplay) earnedDisplay.innerText = CONFIG.formatCurrency(earned);
    },

    renderTasks: function(currentCount, totalYield) {
        const container = document.getElementById('task-container');
        if (!container) return;

        const baseReward = Math.floor(totalYield / this.TOTAL_TASKS);
        let html = '';
        let cumulativeTasksDone = 0;

        for (let i = 1; i <= this.TOTAL_TASKS; i++) {
            const reward = baseReward + (i === this.TOTAL_TASKS ? (totalYield - baseReward * (this.TOTAL_TASKS - 1)) : 0);
            
            let statusClass = 'white-card';
            let btnHtml = '';
            let iconColor = 'bg-cyan-50 text-cyan-600 border-cyan-100';
            let titleColor = 'text-slate-800';
            
            const isCompleted = i <= currentCount;
            const isLocked = i > currentCount + 1;
            
            if (isCompleted) {
                statusClass += ' completed';
                iconColor = 'bg-green-50 text-green-600 border-green-100';
                btnHtml = `<span class="badge badge-success text-xs">DONE</span>`;
                cumulativeTasksDone++;
            } 
            else if (isLocked) {
                statusClass += ' locked';
                iconColor = 'bg-slate-100 text-slate-400 border-slate-200';
                titleColor = 'text-slate-400';
                btnHtml = `<svg class="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>`;
            } 
            else {
                // Active / Next in line
                btnHtml = `<button onclick="TaskManager.startTask(${i})" class="btn btn-primary text-xs px-4 py-2 shadow-md transition-transform active:scale-95">START</button>`;
            }

            html += `
            <div class="${statusClass} p-4 flex items-center justify-between rounded-xl shadow-sm">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 flex items-center justify-center rounded-full border ${iconColor}">
                        <span class="font-bold text-lg">${i}</span>
                    </div>
                    <div>
                        <h3 class="font-bold text-sm ${titleColor}">Task ${i}: Ad Viewing</h3>
                        <p class="text-[10px] font-bold text-cyan-600 mt-0.5">+${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(reward)}</p>
                    </div>
                </div>
                <div>
                    ${btnHtml}
                </div>
            </div>
            `;
        }

        container.innerHTML = html;
    },

    updateClaimButton: function(completedCount, claimedStatus, totalYield) {
        const claimBtn = document.getElementById('claimBtn');
        if (!claimBtn) return;
        
        if (completedCount < this.TOTAL_TASKS) {
            claimBtn.innerText = "TASKS INCOMPLETE";
            claimBtn.disabled = true;
            claimBtn.className = "w-full btn btn-secondary btn-block opacity-50 cursor-not-allowed";
            claimBtn.style.boxShadow = 'none';
        } else if (claimedStatus) {
             claimBtn.innerText = "ALREADY CLAIMED";
             claimBtn.disabled = true;
             claimBtn.className = "w-full btn btn-success text-white btn-block bg-green-600 opacity-75 cursor-not-allowed";
        } else {
            claimBtn.innerText = `CLAIM ALL (${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(totalYield)})`;
            claimBtn.disabled = false;
            claimBtn.className = "w-full btn btn-primary btn-block shadow-lg shadow-cyan-200 transition-all";
            claimBtn.onclick = this.claimReward;
        }
    },

    // --- 3. TASK EXECUTION LOGIC ---

    startTask: function(taskId) {
        // Log to console and redirect to simulated execution page
        console.log(`TaskManager: Starting Task ${taskId}`);
        window.location.href = `task-execution.html?task=${taskId}`;
    },

    // Simulates the completion of the current task
    completeCurrentTask: function() {
        const taskProgress = DB.getTaskProgress();
        if (taskProgress.count >= this.TOTAL_TASKS) return false;

        DB.completeTask(); // Increments count in DB
        
        // This function would be called by task-execution.html's success handler
        console.log(`TaskManager: Task ${taskProgress.count + 1} completed.`);
        return true;
    },

    // --- 4. FINAL CLAIM ---

    claimReward: function() {
        const claimBtn = document.getElementById('claimBtn');
        const totalYield = FinanceManager.calculateDailyYield();
        
        claimBtn.innerText = "CREDITING...";
        claimBtn.disabled = true;

        setTimeout(() => {
            const success = DB.claimDailyReward(totalYield);
            
            if (success) {
                // Update the state so the header balance reflects the change immediately
                State.refresh(); 
                
                alert(`Successfully credited ${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(totalYield)}!`);
                window.location.href = 'dashboard.html';
            } else {
                alert("Claim failed. Please refresh and check task status.");
            }
        }, 1000);
    }
};

// Auto-run on load if we are on the dashboard page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('tasks-dashboard.html')) {
        TaskManager.initDashboard();
    }
    
    // Quick fix for task-execution.html (If user just completed it, update DB)
    if (window.location.pathname.includes('task-execution.html')) {
        // Since we cannot pass state between execution page and here easily, 
        // the task-execution.html should call DB.completeTask() directly, 
        // but adding this check here ensures the final structure is modular.
        // For now, we assume task-execution.html handles its own success logic (as coded previously).
        console.log("TaskManager: Loaded execution page.");
    }
});