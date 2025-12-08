/**
 * CashForge Investment Manager
 * Handles logic for packages.html and my-investments.html pages.
 * Dependencies: config.js, db.js, finance.js, state.js
 */

const InvestmentManager = {
    
    // --- UTILITIES ---
    
    /**
     * Calculates the percentage progress of an investment plan.
     * @param {number} daysRun 
     * @param {number} totalDays 
     * @returns {number} Percentage (0-100)
     */
    calculateProgress: function(daysRun, totalDays) {
        if (totalDays === 0) return 0;
        return Math.min(100, (daysRun / totalDays) * 100);
    },

    // --- PACKAGES PAGE LOGIC (packages.html) ---

    /**
     * Renders the full list of investment packages on packages.html.
     */
    renderPackagesPage: async function() {
        const container = document.getElementById('packages-container');
        if (!container) return;

        // Fetch plans from the database (or cache, handled by DB)
        const allPlans = await DB.getPlansData();

        let html = '';
        
        if (allPlans.length === 0) {
            container.innerHTML = '<div class="text-center text-slate-400 py-10">No investment packages currently available. Please check back later.</div>';
            return;
        }

        allPlans.forEach(pkg => {
            // Data fields correspond to Supabase columns: price, daily_income, duration_days
            const isPopular = pkg.is_popular; 
            const popularTag = isPopular ? `<div class="popular-tag">HOT</div>` : '';
            
            const totalReturn = CONFIG.formatCurrency(pkg.daily_income * pkg.duration_days);
            const priceFormatted = CONFIG.formatCurrency(pkg.price);
            const dailyIncomeFormatted = CONFIG.formatCurrency(pkg.daily_income);

            html += `
            <div class="white-card p-5 relative overflow-hidden">
                ${popularTag}
                
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-700 font-bold text-lg shadow-sm">
                            ${pkg.id}
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-800 text-lg">${pkg.name}</h3>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">${pkg.duration_days} DAYS</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] text-slate-400 font-bold uppercase">Invest</p>
                        <p class="text-lg font-bold text-slate-900">${CONFIG.CURRENCY_SYMBOL} ${priceFormatted}</p>
                    </div>
                </div>

                <div class="layout-grid-2 mb-4">
                    <div class="bg-cyan-50 p-3 rounded-xl border border-cyan-100">
                        <p class="text-[10px] text-slate-500">Daily Income</p>
                        <p class="text-sm font-bold text-cyan-600">+${CONFIG.CURRENCY_SYMBOL} ${dailyIncomeFormatted}</p>
                    </div>
                    <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p class="text-[10px] text-slate-500">Total Return</p>
                        <p class="text-sm font-bold text-slate-700">${CONFIG.CURRENCY_SYMBOL} ${totalReturn}</p>
                    </div>
                </div>

                <button onclick="InvestmentManager.handlePurchaseConfirmation(${pkg.id}, '${pkg.name}', ${pkg.price})" class="w-full btn btn-secondary btn-block shadow-lg shadow-slate-200">
                    INVEST NOW
                </button>
            </div>
            `;
        });
        container.innerHTML = html;
    },

    /**
     * Opens the modal for purchase confirmation.
     * @param {number} id 
     * @param {string} name 
     * @param {number} price 
     */
    handlePurchaseConfirmation: function(id, name, price) {
        // Find current user balance from state
        const currentBalance = State.get('balance');
        
        const modal = document.getElementById('buyModal');
        const modalTitle = document.getElementById('modal-title');
        const modalDesc = document.getElementById('modal-desc');
        const confirmBtn = document.querySelector('#buyModal button[data-role="confirm"]');
        
        if (!modal) return;

        modalTitle.innerText = `Unlock ${name}?`;
        
        if (currentBalance < price) {
            modalDesc.innerHTML = `<span class="text-red-500 font-bold">Insufficient Balance!</span> Required: ${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(price)}.`;
            confirmBtn.innerText = "FUND WALLET";
            confirmBtn.onclick = () => window.location.href = 'deposit.html';
            confirmBtn.disabled = false; // Enable for redirection
        } else {
            modalDesc.innerHTML = `Price: <span class="text-cyan-600 font-bold">${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(price)}</span>. Deducted from your current balance of ${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(currentBalance)}.`;
            confirmBtn.innerText = "CONFIRM PURCHASE";
            confirmBtn.onclick = () => this.handlePurchase(id);
            confirmBtn.disabled = false;
        }
        
        modal.classList.add('active'); // Use layout.css active class
    },

    /**
     * Executes the actual purchase after confirmation.
     * @param {number} planId 
     */
    handlePurchase: async function(planId) {
        const modal = document.getElementById('buyModal');
        const confirmBtn = document.querySelector('#buyModal button[data-role="confirm"]');
        
        confirmBtn.innerText = "PROCESSING...";
        confirmBtn.disabled = true;

        const result = await FinanceManager.purchaseInvestment(planId); 

        setTimeout(() => {
            if (result.success) {
                alert("Investment successful!");
                window.location.href = 'my-investments.html';
            } else {
                alert(`Purchase failed: ${result.msg}`);
                // Restore button state and close modal
                confirmBtn.innerText = "Confirm";
                confirmBtn.disabled = false;
                modal.classList.remove('active');
            }
        }, 1000);
    },

    // --- MY INVESTMENTS PAGE LOGIC (my-investments.html) ---

    /**
     * Renders the user's active investment plans on my-investments.html.
     */
    renderMyInvestments: async function() {
        // Fetches active investments with plan details joined
        const investments = await DB.getMyActiveInvestments();
        const container = document.getElementById('invest-list');
        if (!container) return;
        
        const today = new Date();
        let totalInvested = 0;
        let totalDailyYield = 0;

        if (investments.length === 0) {
            container.innerHTML = `
                <div class="text-center text-slate-400 py-10 text-sm">
                    No active investments found.
                    <a href="packages.html" class="text-cyan-600 font-bold ml-1">Invest Now!</a>
                </div>
            `;
        } else {
            let html = '';
            
            investments.forEach(inv => {
                const planDetails = inv.plan_id; // Data from the Supabase JOIN
                
                const startDate = new Date(inv.start_date);
                // Calculate days run since purchase
                const timeDiff = Math.abs(today.getTime() - startDate.getTime());
                const daysRun = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24))) - 1; // Exclude current day and start day
                const daysLeft = Math.max(0, inv.duration_days - daysRun);
                
                const progressPercent = this.calculateProgress(daysRun, inv.duration_days);
                
                totalInvested += inv.invested_amount;
                totalDailyYield += inv.daily_income;

                html += `
                <div class="white-card p-5 relative overflow-hidden">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600 font-bold border border-cyan-100">
                                V${inv.plan_id}
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-800 text-sm">${planDetails.name}</h3>
                                <p class="text-[10px] text-slate-500 font-medium">Started: ${inv.start_date}</p>
                            </div>
                        </div>
                        <span class="badge badge-success">${daysLeft > 0 ? 'ACTIVE' : 'EXPIRED'}</span>
                    </div>

                    <div class="layout-grid-2 gap-4 mb-4 border-b border-slate-50 pb-4">
                        <div>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Invested</p>
                            <p class="text-sm font-bold text-slate-800">${CONFIG.formatCurrency(inv.invested_amount)}</p>
                        </div>
                         <div class="text-right">
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Daily Income</p>
                            <p class="text-sm font-bold text-cyan-600">+${CONFIG.formatCurrency(inv.daily_income)}</p>
                        </div>
                    </div>

                    <div>
                        <div class="row-between text-[10px] text-slate-500 font-medium mb-1.5">
                            <span>Progress (${daysRun}/${inv.duration_days} Days)</span>
                            <span class="text-cyan-600">${progressPercent.toFixed(1)}%</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                </div>
                `;
            });
            container.innerHTML = html;
        }

        // Update Summary Stats (Total Invested and Total Daily Yield)
        document.querySelector('#total-invested-display').innerText = CONFIG.formatCurrency(totalInvested);
        document.querySelector('#total-daily-yield-display').innerText = `+${CONFIG.formatCurrency(totalDailyYield)}`;
    }
};

// --- Auto-Run Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    // Bind modal close button
    const closeModalBtn = document.querySelector('#buyModal button[data-role="cancel"]');
    if (closeModalBtn) {
        closeModalBtn.onclick = () => document.getElementById('buyModal').classList.remove('active');
    }

    // Check which page we are on and render accordingly
    if (path.includes('packages.html')) {
        InvestmentManager.renderPackagesPage();
    }
    
    if (path.includes('my-investments.html')) {
        InvestmentManager.renderMyInvestments();
    }
});
