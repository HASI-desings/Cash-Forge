/**
 * Team Controller - CashForge
 * Handles Referral Code Generation, 3-Level Hierarchy Fetching, and UI Updates.
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
        try {
            // A. Check Session
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = 'index.html';
                return;
            }

            // B. Get Full Profile
            let { data: profile, error } = await supabase
                .from('users')
                .select('id, full_name, referral_code, team_size, total_commission, vip_level')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            // C. Auto-Generate Referral Code if Missing
            if (!profile.referral_code) {
                const newCode = 'CF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                
                await supabase
                    .from('users')
                    .update({ referral_code: newCode })
                    .eq('id', user.id);
                
                profile.referral_code = newCode; // Update local profile
            }

            this.currentUser = profile;

            // D. Render Initial UI
            this.renderReferralInfo();
            
            // E. Load Hierarchy
            this.loadTeamData();

        } catch (err) {
            console.error("Init Error:", err);
            if(typeof showNotification === 'function') showNotification("Failed to load profile", "error");
        }
    },

    // --- 2. RENDER REFERRAL INFO ---
    renderReferralInfo() {
        if (!this.currentUser) return;

        // 1. Construct Link
        const baseUrl = window.location.origin;
        // Adjust path if your register file is inside a folder, otherwise assume root
        const refLink = `${baseUrl}/register.html?ref=${this.currentUser.referral_code}`;

        // 2. Update UI Elements (IDs from team.html)
        const linkDisplay = document.getElementById('ref-link-display');
        const hiddenInput = document.getElementById('ref-input-hidden');
        const codeDisplay = document.getElementById('ref-code-display');
        const commDisplay = document.getElementById('total-comm');

        if(linkDisplay) linkDisplay.innerText = refLink;
        if(hiddenInput) hiddenInput.value = refLink;
        if(codeDisplay) codeDisplay.innerText = this.currentUser.referral_code;
        
        // 3. Render Commission (formatted)
        if(commDisplay) {
            commDisplay.innerText = 'PKR ' + (this.currentUser.total_commission || 0).toLocaleString();
        }
    },

    // --- 3. FETCH TEAM DATA (Waterfall) ---
    async loadTeamData() {
        const userId = this.currentUser.id;

        try {
            // STEP A: Fetch Level 1 (Direct Referrals)
            const { data: level1, error: err1 } = await supabase
                .from('users')
                .select('id, full_name, created_at, vip_level')
                .eq('upline_id', userId);

            if (err1) throw err1;
            this.data.lvl1 = level1 || [];

            // STEP B: Fetch Level 2 (Referrals of Level 1)
            const l1Ids = this.data.lvl1.map(u => u.id);
            let level2 = [];
            
            if (l1Ids.length > 0) {
                const { data: l2Data, error: err2 } = await supabase
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
                const { data: l3Data, error: err3 } = await supabase
                    .from('users')
                    .select('id, full_name, created_at, vip_level, upline_id')
                    .in('upline_id', l2Ids);
                if (err3) throw err3;
                level3 = l3Data || [];
            }
            this.data.lvl3 = level3;

            // STEP D: Update Stats UI
            this.updateStats();

        } catch (error) {
            console.error("Team Load Error:", error);
            showNotification("Failed to refresh team data", "error");
        }
    },

    // --- 4. UPDATE STATS & COUNTS ---
    updateStats() {
        // 1. Calculate Total Team Size
        const totalSize = this.data.lvl1.length + this.data.lvl2.length + this.data.lvl3.length;
        
        // 2. Update "Team Size" Card
        const sizeEl = document.getElementById('team-size');
        if(sizeEl) sizeEl.innerText = totalSize;

        // 3. Update Level Badges (Counts)
        const l1Badge = document.getElementById('lvl-1-count');
        const l2Badge = document.getElementById('lvl-2-count');
        const l3Badge = document.getElementById('lvl-3-count');

        if(l1Badge) l1Badge.innerText = this.data.lvl1.length;
        if(l2Badge) l2Badge.innerText = this.data.lvl2.length;
        if(l3Badge) l3Badge.innerText = this.data.lvl3.length;
    },

    // --- 5. ACTIONS (Copy & Share) ---
    copyReferral() {
        const link = document.getElementById('ref-input-hidden')?.value;
        if (!link) return;

        navigator.clipboard.writeText(link).then(() => {
            showNotification("Referral Link Copied!", "success");
        }).catch(err => {
            console.error(err);
            showNotification("Failed to copy link", "error");
        });
    },

    shareNative() {
        const link = document.getElementById('ref-input-hidden')?.value;
        const code = this.currentUser?.referral_code || '';

        if (navigator.share) {
            navigator.share({
                title: 'Join CashForge',
                text: `Use my code ${code} to start earning!`,
                url: link
            }).catch(console.error);
        } else {
            // Fallback for desktop/unsupported
            this.copyReferral();
        }
    }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    TeamController.init();

    // Expose functions to global scope for HTML onclick="" events
    window.copyReferral = () => TeamController.copyReferral();
    window.shareNative = () => TeamController.shareNative();
});
