/* Team Controller - CashForge
   Handles fetching the MLM hierarchy (Levels 1, 2, 3), 
   calculating team stats, and UI rendering.
*/

const TeamController = {
    // State to hold loaded members
    data: {
        lvl1: [],
        lvl2: [],
        lvl3: []
    },
    currentUser: null,

    // --- 1. INITIALIZE ---
    async init() {
        // A. Check Session
        const sessionUser = await AuthService.checkSession();
        if (!sessionUser) return;

        // B. Get Full Profile (We need the referral_code and ID)
        this.currentUser = await AuthService.getProfile();
        
        if (this.currentUser) {
            this.renderReferralCode();
            this.loadTeamData();
        }
    },

    // --- 2. RENDER REFERRAL INFO ---
    renderReferralCode() {
        // Update the footer text with actual code
        const footerCode = document.querySelector('.action-row strong');
        if (footerCode) footerCode.innerText = this.currentUser.referral_code;
    },

    // --- 3. FETCH TEAM DATA (The Waterfall Method) ---
    async loadTeamData() {
        const userId = this.currentUser.id;
        const loader = document.getElementById('team-list');
        loader.innerHTML = '<div style="text-align:center; padding:20px; color:#999;">Loading Team Data...</div>';

        try {
            // STEP A: Fetch Level 1 (Direct Referrals)
            // Query: Users who have MY ID as their upline_id
            const { data: level1, error: err1 } = await window.sb
                .from('users')
                .select('id, full_name, created_at, vip_level, balance')
                .eq('upline_id', userId);

            if (err1) throw err1;
            this.data.lvl1 = level1 || [];

            // STEP B: Fetch Level 2 (Referrals of Level 1)
            // We need an array of all L1 IDs to query L2
            const l1Ids = this.data.lvl1.map(u => u.id);
            let level2 = [];
            
            if (l1Ids.length > 0) {
                const { data: l2Data, error: err2 } = await window.sb
                    .from('users')
                    .select('id, full_name, created_at, vip_level, upline_id')
                    .in('upline_id', l1Ids);
                if (err2) throw err2;
                level2 = l2Data || [];
            }
            this.data.lvl2 = level2;

            // STEP C: Fetch Level 3 (Referrals of Level 2)
            const l2Ids = this.data.lvl2.map(u => u.id);
            let level3 = [];
            
            if (l2Ids.length > 0) {
                const { data: l3Data, error: err3 } = await window.sb
                    .from('users')
                    .select('id, full_name, created_at, vip_level, upline_id')
                    .in('upline_id', l2Ids);
                if (err3) throw err3;
                level3 = l3Data || [];
            }
            this.data.lvl3 = level3;

            // STEP D: Update Dashboard Stats (Total members, etc)
            this.updateStats();

            // STEP E: Render Level 1 by default
            this.switchTab(1);

        } catch (error) {
            console.error("Team Load Error:", error);
            loader.innerHTML = '<div style="text-align:center; color:red;">Failed to load team data.</div>';
        }
    },

    // --- 4. UPDATE STATS UI ---
    updateStats() {
        // 1. Calculate Total Team Size
        const totalMembers = this.data.lvl1.length + this.data.lvl2.length + this.data.lvl3.length;
        
        // 2. Calculate Active Investors (VIP Level > 0)
        const activeL1 = this.data.lvl1.filter(u => u.vip_level > 0).length;
        const activeL2 = this.data.lvl2.filter(u => u.vip_level > 0).length;
        const activeL3 = this.data.lvl3.filter(u => u.vip_level > 0).length;
        const totalActive = activeL1 + activeL2 + activeL3;

        // 3. Update DOM Elements
        // We find the specific mini-cards by content or structure
        const statValues = document.querySelectorAll('.mini-card div[style*="font-size: 18px"]');
        if (statValues.length >= 2) {
            statValues[0].innerText = totalMembers;
            statValues[1].innerText = totalActive;
        }
        
        // 4. Update Commission Display
        // Note: For a real app, you would sum up 'commission' type transactions from the transactions table.
        // For MVP, let's try to fetch actual commissions or show a placeholder based on activity.
        // Here we just update the total commission UI if we have that data in the user profile or calc it.
        // For now, let's assuming "balance" reflects it, or we leave the static number if no commission logic exists yet.
    },

    // --- 5. SWITCH TAB LOGIC ---
    switchTab(level) {
        // Update Tabs UI
        document.querySelectorAll('.tab-btn').forEach((btn, index) => {
            if (index + 1 === level) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        // Determine which data to show
        const users = level === 1 ? this.data.lvl1 : (level === 2 ? this.data.lvl2 : this.data.lvl3);
        const listContainer = document.getElementById('team-list');
        listContainer.innerHTML = '';

        if (users.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align:center; padding:30px; color:#aaa;">
                    <i data-lucide="users" style="width:30px; height:30px; opacity:0.3; margin-bottom:10px;"></i>
                    <p style="font-size:12px;">No members in Level ${level} yet.</p>
                </div>`;
            lucide.createIcons();
            return;
        }

        // Render List
        users.forEach(u => {
            // Privacy Masking (e.g., Rud...123)
            const maskedName = u.full_name.length > 3 
                ? u.full_name.substring(0, 3) + "***" 
                : u.full_name;

            const isVip = u.vip_level > 0;
            const joinDate = Formatters.date(u.created_at); // Use our Formatter!

            const item = document.createElement('div');
            item.className = `member-item ${isVip ? 'active-investor' : ''}`;
            
            item.innerHTML = `
                <div class="mem-info">
                    <h4>${maskedName} <span style="font-size:9px; background:#eee; padding:2px 4px; border-radius:4px;">L${level}</span></h4>
                    <span>Joined: ${joinDate}</span>
                </div>
                <div class="mem-profit">
                    ${isVip ? '<span style="color:#2ecc71">Active</span>' : '<span style="color:#999">Inactive</span>'}
                </div>
            `;
            listContainer.appendChild(item);
        });
    },

    // --- 6. COPY REFERRAL LINK ---
    copyReferral() {
        if (!this.currentUser) return;
        
        // Build link based on current domain
        const link = `${window.location.origin}/register.html?ref=${this.currentUser.referral_code}`;
        
        navigator.clipboard.writeText(link).then(() => {
            UI.toast("Referral Link Copied!", "success");
        }).catch(err => {
            console.error('Copy failed', err);
            UI.toast("Failed to copy link.", "error");
        });
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    TeamController.init();
    
    // Attach Global Functions for HTML onClick attributes
    window.switchTab = (lvl) => TeamController.switchTab(lvl);
    window.copyReferral = () => TeamController.copyReferral();
    window.openChartModal = () => document.getElementById('chart-modal').style.display = 'flex';
});