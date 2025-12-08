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
        return (daysRun / totalDays) * 100;
    },

    // --- PACKAGES PAGE LOGIC ---

    /**
     * Renders the full list of investment packages on packages.html.
     */
    renderPackagesPage: function() {
        const container = document.getElementById('packages-container');
        if (!container) return;

        let html = '';
        CONFIG.PLANS.forEach(pkg => {
            const isPopular = pkg.id === 3; // Mocking Advanced Plan as popular
            const popularTag = isPopular ? `<div class="popular-tag">HOT</div>` : '';
            
            const monthly = CONFIG.formatCurrency(pkg.daily * 30);
            const total = CONFIG.formatCurrency(pkg.daily * pkg.days);
            const priceFormatted = CONFIG.formatCurrency(pkg.price);

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
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">${pkg.days} DAYS</p>
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
                        <p class="text-sm font-bold text-cyan-600">+${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(pkg.daily)}</p>
                    </div>
                    <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p class="text-[10px] text-slate-500">Total Return</p>
                        <p class="text-sm font-bold text-slate-700">${CONFIG.CURRENCY_SYMBOL} ${total}</p>
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
        // Assume modal elements exist from packages.html structure
        const modal = document.getElementById('buyModal');
        const modalTitle = document.getElementById('modal-title');
        const modalDesc = document.getElementById('modal-desc');
        const confirmBtn = document.querySelector('#buyModal button:last-child');
        
        if (!modal) return;

        modalTitle.innerText = `Unlock ${name}?`;
        modalDesc.innerHTML = `Price: <span class="text-cyan-600 font-bold">${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(price)}</span>. Deducted from balance.`;
        
        // Use an anonymous function or bind data to the button
        confirmBtn.onclick = () => this.handlePurchase(id);
        
        modal.classList.remove('hidden');
    },

    /**
     * Executes the actual purchase after confirmation.
     * @param {number} planId 
     */
    handlePurchase: function(planId) {
        const modal = document.getElementById('buyModal');
        const confirmBtn = document.querySelector('#buyModal button:last-child');
        
        confirmBtn.innerText = "Processing...";
        confirmBtn.disabled = true;

        const result = FinanceManager.purchaseInvestment(planId); // Calls DB.buyPlan

        setTimeout(() => {
            if (result.success) {
                // Update balance state globally
                State.refresh(); 
                
                alert("Investment successful!");
                window.location.href = 'my-investments.html';
            } else {
                alert(`Purchase failed: ${result.msg}`);
                confirmBtn.innerText = "Confirm";
                confirmBtn.disabled = false;
                modal.classList.add('hidden');
            }
        }, 1000);
    },

    // --- MY INVESTMENTS PAGE LOGIC ---

    /**
     * Renders the user's active investment plans on my-investments.html.
     */
    renderMyInvestments: function() {
        const investments = DB.getMyPlans();
        const container = document.getElementById('invest-list');
        if (!container) return;
        
        if (investments.length === 0) {
            container.innerHTML = `
                <div class="text-center text-slate-400 py-10 text-sm">
                    No active investments found.
                    <a href="packages.html" class="text-cyan-600 font-bold ml-1">Invest Now!</a>
                </div>
            `;
            // Also update the summary stats (Mock)
            document.querySelector('.grid-cols-2 div:first-child p.text-lg').innerText = '0';
            document.querySelector('.grid-cols-2 div:last-child p.text-lg').innerText = '+0';
            return;
        }

        let totalInvested = 0;
        let totalDailyYield = 0;
        let html = '';
        
        const today = new Date().toISOString().split('T')[0];

        investments.forEach(inv => {
            const progressPercent = this.calculateProgress(inv.daysRun, inv.totalDays);
            
            // Mocking daily progression for demo simplicity
            // In a real app, inv.daysRun would be calculated from startDate on load.
            const daysRunMock = inv.daysRun + (inv.daysRun === 0 ? 1 : 0);
            
            totalInvested += inv.invested;
            totalDailyYield += inv.daily;

            html += `
            <div class="white-card p-5 relative overflow-hidden">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600 font-bold border border-cyan-100">
                            V${inv.planId}
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-800 text-sm">${inv.name}</h3>
                            <p class="text-[10px] text-slate-500 font-medium">Started: ${inv.startDate}</p>
                        </div>
                    </div>
                    <span class="badge badge-success">ACTIVE</span>
                </div>

                <div class="layout-grid-2 gap-4 mb-4 border-b border-slate-50 pb-4">
                    <div>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Invested</p>
                        <p class="text-sm font-bold text-slate-800">${CONFIG.formatCurrency(inv.invested)}</p>
                    </div>
                     <div class="text-right">
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Daily Income</p>
                        <p class="text-sm font-bold text-cyan-600">+${CONFIG.formatCurrency(inv.daily)}</p>
                    </div>
                </div>

                <div>
                    <div class="row-between text-[10px] text-slate-500 font-medium mb-1.5">
                        <span>Progress (${daysRunMock}/${inv.totalDays} Days)</span>
                        <span class="text-cyan-600">${this.calculateProgress(daysRunMock, inv.totalDays).toFixed(1)}%</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${this.calculateProgress(daysRunMock, inv.totalDays)}%"></div>
                    </div>
                </div>
            </div>
            `;
        });
        
        container.innerHTML = html;

        // Update Summary Stats
        document.querySelector('#invest-list').closest('main').querySelector('.grid-cols-2 div:first-child p.text-lg').innerText = CONFIG.formatCurrency(totalInvested);
        document.querySelector('#invest-list').closest('main').querySelector('.grid-cols-2 div:last-child p.text-lg').innerText = `+${CONFIG.formatCurrency(totalDailyYield)}`;
    }
};

// --- Auto-Run Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // Check which page we are on and render accordingly
    if (window.location.pathname.includes('packages.html')) {
        InvestmentManager.renderPackagesPage();
    }
    
    if (window.location.pathname.includes('my-investments.html')) {
        InvestmentManager.renderMyInvestments();
    }
});