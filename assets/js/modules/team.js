/**
 * CashForge Team Manager
 * Handles logic for team-overview.html, team-tier-X.html, and vip-salary.html pages.
 * Fetches real member counts and calculates VIP progress based on DB data.
 * Dependencies: config.js, db.js, state.js
 */

const TeamManager = {
    
    // --- 1. TEAM OVERVIEW LOGIC ---

    /**
     * Renders the team overview section with live stats.
     */
    renderTeamOverview: async function() {
        // Fetch current user details
        const user = await DB.getUser();
        if (!user) return;
        
        // Fetch aggregated team stats (Requires Supabase Function/View)
        const stats = await DB.getTeamStats(); 
        
        // 1. Update Tier Counts
        document.getElementById('l1-count').innerText = CONFIG.formatCount(stats.l1Members);
        document.getElementById('l2-count').innerText = CONFIG.formatCount(stats.l2Members);
        document.getElementById('l3-count').innerText = CONFIG.formatCount(stats.l3Members);

        // 2. Update overall rewards in header pill
        const rewardsEl = document.querySelector('.app-header .text-xs:last-child');
        if (rewardsEl) rewardsEl.innerText = `${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(stats.totalCommission)}`;

        // 3. Update Referral Link in invite card
        const linkEl = document.querySelector('.invite-card input[type="text"]');
        if (linkEl) linkEl.value = CONFIG.REF_LINK_BASE + user.uid; // Use user's unique referral UID
    },

    // --- 2. TIER LIST RENDERING ---
    
    /**
     * Renders the member list for a specific tier level (1, 2, or 3).
     * @param {number} level 
     */
    renderTierList: async function(level) {
        const container = document.getElementById('members-list');
        if (!container) return;
        
        // Fetch members for the specific tier level from the DB
        const members = await DB.getTierMembers(level);
        
        // Determine rates and labels for the header
        const commissionRate = level === 1 ? '25%' : (level === 2 ? '10%' : '5%');
        const headerLabel = level === 1 ? 'Direct Team' : (level === 2 ? 'Secondary Team' : 'Extended Team');
        
        // Update List Header
        document.querySelector('h2.text-sm').innerText = headerLabel;
        document.querySelector('.app-header + main span.font-medium').innerText = `Rate: ${commissionRate}`;
        
        if (members.length === 0) {
             container.innerHTML = `
                <div class="text-center py-10 opacity-60">
                    <div class="w-16 h-16 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-3">
                        <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                    <p class="text-sm font-medium text-slate-500">No members found in Level ${level} yet.</p>
                </div>
            `;
            // Update Summary Stats
            document.querySelector('.grid-cols-2 div:first-child p.text-xl').innerText = CONFIG.formatCount(0);
            document.querySelector('.grid-cols-2 div:last-child p.text-xl').innerText = `${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(0)}`;
            return;
        }

        let html = '';
        members.forEach(member => {
            const statusHtml = member.active 
                ? `<span class="badge badge-success">Active</span>`
                : `<span class="badge badge-info text-slate-400 bg-slate-50 border-slate-100">Inactive</span>`;

            html += `
            <div class="white-card p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shadow-sm border border-slate-200">
                        ${member.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-0.5">
                            <h4 class="font-bold text-sm text-slate-800">${member.user_name}</h4>
                            ${statusHtml}
                        </div>
                        <p class="text-[10px] text-slate-400">Joined: ${new Date(member.joined_at).toISOString().split('T')[0]}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-[10px] text-slate-400 uppercase font-bold">Commission</p>
                    <p class="text-sm font-bold text-slate-800">${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(member.commission_earned)}</p>
                </div>
            </div>
            `;
        });
        container.innerHTML = html;
        
        // Update Summary Stats
        const totalCommission = members.reduce((sum, member) => sum + member.commission_earned, 0);
        document.querySelector('.grid-cols-2 div:first-child p.text-xl').innerText = CONFIG.formatCount(members.length);
        document.querySelector('.grid-cols-2 div:last-child p.text-xl').innerText = `${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(totalCommission)}`;
    },

    // --- 3. VIP SALARY LOGIC ---

    renderVIPSalaary: async function() {
        const container = document.getElementById('salary-list');
        if (!container) return;

        const user = await DB.getUser();
        // Mock active directs calculation (Requires database view/function)
        const activeDirects = user.active_directs_count || 3; 

        let html = '';

        CONFIG.SALARY_TIERS.forEach(tier => {
            const isAchieved = activeDirects >= tier.req;
            const isCurrentLevel = tier.level === user.vip_level;
            const isNextLevel = tier.level === user.vip_level + 1;
            
            let btnText, btnClass;
            
            if (isCurrentLevel) {
                btnText = "CURRENT VIP LEVEL";
                btnClass = "btn btn-secondary text-white bg-gold-600 opacity-90";
            } else if (isAchieved && isNextLevel) { // Ready to claim next level
                btnText = `CLAIM VIP ${tier.level} SALARY`;
                btnClass = "btn btn-primary bg-green-500 hover:bg-green-600";
            } else {
                btnText = `LOCKED (${CONFIG.formatCount(activeDirects)}/${CONFIG.formatCount(tier.req)})`;
                btnClass = "btn btn-outline border-slate-200 text-slate-400 cursor-not-allowed";
            }

            html += `
            <div class="white-card p-5 ${!isAchieved && !isCurrentLevel ? 'opacity-50 grayscale' : ''}">
                <div class="row-between mb-3">
                    <div class="row-start gap-3">
                        <div class="w-10 h-10 bg-gold-100 rounded-full flex-center font-bold border border-gold-400 text-gold-600">
                            V${tier.level}
                        </div>
                        <div>
                            <h4 class="font-bold text-sm text-slate-800">VIP Level ${tier.level}</h4>
                            <p class="text-xs text-slate-500">Require: ${CONFIG.formatCount(tier.req)} Active Members</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] text-slate-400 uppercase font-bold">Salary</p>
                        <p class="text-lg font-bold text-slate-800">${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(tier.amount)}</p>
                    </div>
                </div>
                
                <button ${isAchieved && isNextLevel ? '' : 'disabled'} class="w-full btn text-xs ${btnClass}" onclick="TeamManager.claimSalary(${tier.level}, ${tier.amount})">
                    ${btnText}
                </button>
            </div>
            `;
        });
        container.innerHTML = html;
        
        // Update Hero Progress
        const nextLevel = CONFIG.SALARY_TIERS.find(t => t.level > user.vip_level) || CONFIG.SALARY_TIERS[0];
        const progressPercent = TeamManager.calculateProgress(activeDirects, nextLevel.req);
        
        document.querySelector('.hero-card .text-3xl').innerText = `VIP ${user.vip_level}`;
        document.querySelector('.hero-card .w-full').previousElementSibling.querySelector('span:last-child').innerText = `${CONFIG.formatCount(activeDirects)} / ${CONFIG.formatCount(nextLevel.req)} Members`;
        document.querySelector('.hero-card .w-full div').style.width = `${progressPercent}%`;
    },

    // --- 4. ACTIONS & UTILITIES ---

    calculateProgress: function(current, target) {
        if (target === 0) return 0;
        return Math.min(100, (current / target) * 100);
    },

    claimSalary: async function(level, amount) {
        const user = await DB.getUser();

        if (user.vip_level >= level) {
            alert("You have already claimed or surpassed this level.");
            return;
        }

        const confirmed = confirm(`Are you sure you want to claim VIP ${level} salary of ${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(amount)}?`);
        if (!confirmed) return;

        const result = await DB.claimVIPSalaary(level, amount); 
        
        if (result.success) {
            await State.refresh();
            alert(`Salary claimed! ${CONFIG.CURRENCY_SYMBOL} ${CONFIG.formatCurrency(amount)} credited.`);
            TeamManager.renderVIPSalaary(); // Re-render the page
        } else {
            alert(`Claim failed: ${result.msg}`);
        }
    },

    copyReferralLink: async function() {
        const user = await DB.getUser();
        if (!user || !user.uid) return;
        
        // Uses the unique UID stored in the database for the referral link
        const link = CONFIG.REF_LINK_BASE + user.uid;
        const btn = document.getElementById('copyBtn');
        
        await navigator.clipboard.writeText(link).then(() => {
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
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) copyBtn.onclick = TeamManager.copyReferralLink;
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
