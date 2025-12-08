/**
 * CashForge Team Manager
 * Handles logic for team-overview.html, team-tier-X.html, and vip-salary.html pages.
 * Dependencies: config.js, db.js, state.js
 */

const TeamManager = {
    
    // --- 1. MOCK DATA SETUP ---
    // A consolidated list of mock users to simulate team levels
    MOCK_USERS: [
        { id: "USER-9921", date: "2023-10-25", investment: 50000, commission: 12500, active: true, level: 1 },
        { id: "USER-8842", date: "2023-10-24", investment: 10000, commission: 2500, active: true, level: 1 },
        { id: "USER-1102", date: "2023-10-22", investment: 0, commission: 0, active: false, level: 1 },
        
        { id: "USER-2091", date: "2023-10-25", investment: 25000, commission: 2500, active: true, level: 2 },
        { id: "USER-4182", date: "2023-10-24", investment: 900, commission: 90, active: true, level: 2 },
        { id: "USER-3391", date: "2023-10-23", investment: 5000, commission: 500, active: true, level: 2 },
        
        { id: "USER-3211", date: "2023-10-25", investment: 25000, commission: 1250, active: true, level: 3 },
        { id: "USER-1192", date: "2023-10-20", investment: 10000, commission: 500, active: true, level: 3 },
        { id: "USER-5511", date: "2023-10-21", investment: 0, commission: 0, active: false, level: 3 },
        // Total: 9 members tracked for stats
    ],

    // --- 2. TEAM OVERVIEW LOGIC ---

    /**
     * Calculates total team statistics for team-overview.html.
     * @returns {object} {totalMembers, totalCommission, l1Members, l2Members, l3Members}
     */
    calculateTeamStats: function() {
        let totalCommission = 0;
        let l1Members = 0;
        let l2Members = 0;
        let l3Members = 0;

        this.MOCK_USERS.forEach(user => {
            totalCommission += user.commission;
            if (user.level === 1) l1Members++;
            if (user.level === 2) l2Members++;
            if (user.level === 3) l3Members++;
        });

        return {
            totalMembers: this.MOCK_USERS.length,
            totalCommission: totalCommission,
            l1Members: l1Members,
            l2Members: l2Members,
            l3Members: l3Members
        };
    },

    /**
     * Renders the team overview section.
     */
    renderTeamOverview: function() {
        const stats = this.calculateTeamStats();
        
        // Mock team size update to UI elements on the overview page
        const l1CountEl = document.querySelector('[onclick*="team-tier-1.html"] .text-lg');
        const l2CountEl = document.querySelector('[onclick*="team-tier-2.html"] .text-lg');
        const l3CountEl = document.querySelector('[onclick*="team-tier-3.html"] .text-lg');
        
        if (l1CountEl) l1CountEl.innerText = stats.l1Members;
        if (l2CountEl) l2CountEl.innerText = stats.l2Members;
        if (l3CountEl) l3CountEl.innerText = stats.l3Members;

        // Update overall rewards in header pill (mock)
        const rewardsEl = document.querySelector('.app-header .text-xs:last-child');
        if (rewardsEl) rewardsEl.innerText = CONFIG.CURRENCY_SYMBOL + ' ' + CONFIG.formatCurrency(stats.totalCommission);

        // Update link in invite card (hardcoded for simplicity, but cleaner than inline)
        const linkEl = document.querySelector('.invite-card input[type="text"]');
        if (linkEl) linkEl.value = CONFIG.REF_LINK_BASE + DB.getUser().uid.substring(4);
    },

    // --- 3. TIER LIST RENDERING ---
    
    /**
     * Renders the member list for a specific tier level (1, 2, or 3).
     * @param {number} level 
     */
    renderTierList: function(level) {
        const container = document.getElementById('members-list');
        if (!container) return;
        
        const filteredMembers = this.MOCK_USERS.filter(u => u.level === level);
        
        if (filteredMembers.length === 0) {
            container.innerHTML = `
                <div class="text-center py-10 opacity-60">
                    <div class="w-16 h-16 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-3">
                        <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                    <p class="text-sm font-medium text-slate-500">No members found in Level ${level} yet.</p>
                </div>
            `;
            return;
        }

        let html = '';
        filteredMembers.forEach(member => {
            const statusHtml = member.active 
                ? `<span class="badge badge-success">Active</span>`
                : `<span class="badge badge-info text-slate-400 bg-slate-50 border-slate-100">Inactive</span>`;

            html += `
            <div class="white-card p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shadow-sm border border-slate-200">
                        ${member.id.substring(5,7)}
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-0.5">
                            <h4 class="font-bold text-sm text-slate-800">${member.id}</h4>
                            ${statusHtml}
                        </div>
                        <p class="text-[10px] text-slate-400">Joined: ${member.date}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-[10px] text-slate-400 uppercase font-bold">Commission</p>
                    <p class="text-sm font-bold text-slate-800">${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(member.commission)}</p>
                </div>
            </div>
            `;
        });
        container.innerHTML = html;
        
        // Update Summary Stats (Mock)
        const totalMembersEl = document.querySelector('main .grid-cols-2 div:first-child p.text-xl');
        if (totalMembersEl) totalMembersEl.innerText = filteredMembers.length;
        
        const totalCommissionEl = document.querySelector('main .grid-cols-2 div:last-child p.text-xl');
        const totalCommission = filteredMembers.reduce((sum, user) => sum + user.commission, 0);
        if (totalCommissionEl) totalCommissionEl.innerText = CONFIG.CURRENCY_SYMBOL + ' ' + CONFIG.formatCurrency(totalCommission);
    },

    // --- 4. VIP SALARY LOGIC ---

    renderVIPSalaary: function() {
        const container = document.getElementById('salary-list');
        if (!container) return;

        const user = DB.getUser();
        const activeDirects = this.MOCK_USERS.filter(u => u.level === 1 && u.active).length;
        let html = '';

        CONFIG.SALARY_TIERS.forEach(tier => {
            const isAchieved = activeDirects >= tier.req;
            const isClaimed = tier.level === user.vipLevel; // Mocking claim status by current level
            
            let btnText, btnClass;
            
            if (isClaimed && isAchieved) {
                btnText = "CURRENT VIP LEVEL";
                btnClass = "btn btn-secondary text-white bg-gold-600 opacity-90";
            } else if (isAchieved) {
                btnText = `CLAIM VIP ${tier.level} SALARY`;
                btnClass = "btn btn-primary bg-green-500 hover:bg-green-600";
            } else {
                btnText = `LOCKED (${activeDirects}/${tier.req})`;
                btnClass = "btn btn-outline border-slate-200 text-slate-400 cursor-not-allowed";
            }

            html += `
            <div class="white-card p-5 ${!isAchieved ? 'opacity-50 grayscale' : ''}">
                <div class="row-between mb-3">
                    <div class="row-start gap-3">
                        <div class="w-10 h-10 bg-gold-100 rounded-full flex-center font-bold border border-gold-400 text-gold-600">
                            V${tier.level}
                        </div>
                        <div>
                            <h4 class="font-bold text-sm text-slate-800">VIP Level ${tier.level}</h4>
                            <p class="text-xs text-slate-500">Require: ${tier.req} Active Directs</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-slate-400 uppercase font-bold">Salary</p>
                        <p class="text-lg font-bold text-slate-800">${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(tier.amount)}</p>
                    </div>
                </div>
                
                <button ${isAchieved && !isClaimed ? '' : 'disabled'} class="w-full btn text-xs ${btnClass}" onclick="TeamManager.claimSalary(${tier.level}, ${tier.amount})">
                    ${btnText}
                </button>
            </div>
            `;
        });
        container.innerHTML = html;
        
        // Update Hero Progress (Mocking progress to next level)
        const nextLevel = CONFIG.SALARY_TIERS.find(t => t.level > user.vipLevel) || CONFIG.SALARY_TIERS[CONFIG.SALARY_TIERS.length - 1];
        const progressPercent = (activeDirects / nextLevel.req) * 100;
        
        document.querySelector('.hero-card .text-3xl').innerText = `VIP ${user.vipLevel}`;
        document.querySelector('.hero-card .text-xs:last-child').innerText = `${activeDirects} / ${nextLevel.req} Members`;
        document.querySelector('.hero-card .w-full').previousElementSibling.querySelector('span:last-child').innerText = `${activeDirects} / ${nextLevel.req} Members`;
        document.querySelector('.hero-card .w-full div').style.width = `${Math.min(progressPercent, 100)}%`;
    },

    // --- 5. ACTIONS ---

    claimSalary: function(level, amount) {
        // Mock DB update
        const user = DB.getUser();
        user.vipLevel = level;
        DB.addBalance(amount);
        
        // Note: In real app, this should only be claimable once per month.
        // For mock, we just update the user level and balance.
        
        setTimeout(() => {
            State.refresh();
            alert(`Congrats! ${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(amount)} claimed.`);
            this.renderVIPSalaary(); // Re-render page to show new status
        }, 500);
    },

    copyReferralLink: function() {
        const link = CONFIG.REF_LINK_BASE + DB.getUser().uid.substring(4);
        const btn = document.getElementById('copyBtn');
        
        navigator.clipboard.writeText(link).then(() => {
            const originalText = btn.innerText;
            btn.innerText = "COPIED";
            
            setTimeout(() => {
                btn.innerText = originalText;
            }, 2000);
        });
    }
};

// --- Auto-Run Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('team-overview.html')) {
        TeamManager.renderTeamOverview();
        document.getElementById('copyBtn').onclick = TeamManager.copyReferralLink;
    } 
    
    if (path.includes('team-tier-')) {
        const levelMatch = path.match(/team-tier-(\d+)/);
        if (levelMatch) {
            TeamManager.renderTierList(parseInt(levelMatch[1]));
        }
    }
    
    if (path.includes('vip-salary.html')) {
        TeamManager.renderVIPSalaary();
    }
});

Object.freeze(TeamManager);