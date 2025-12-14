/* Profile Controller - CashForge
   Handles the Profile Hub:
   1. Fetches User Details (Name, Email, Balance, VIP).
   2. Renders dynamic data into the HTML.
   3. Handles Logout.
*/

const ProfileController = {
    currentUser: null,

    // --- 1. INITIALIZE ---
    async init() {
        // A. Check Session
        const sessionUser = await AuthService.checkSession();
        if (!sessionUser) return;

        // B. Get Full Profile
        this.currentUser = await AuthService.getProfile();
        
        if (this.currentUser) {
            this.renderProfile();
        }

        // C. Attach Logout Listener
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => AuthService.logout());
        }
    },

    // --- 2. RENDER DATA ---
    renderProfile() {
        const u = this.currentUser;

        // IDs must match your profile.html
        const elements = {
            name: document.getElementById('profile-name'),
            email: document.getElementById('profile-email'),
            balance: document.getElementById('profile-balance'),
            vip: document.getElementById('profile-vip'),
            id: document.getElementById('profile-id'),
            invite: document.getElementById('profile-invite')
        };

        // Update Text Content
        if (elements.name) elements.name.innerText = u.full_name || 'CashForge User';
        if (elements.email) elements.email.innerText = Formatters.maskEmail(u.email);
        
        // Balance (using Formatter)
        if (elements.balance) elements.balance.innerText = Formatters.currency(u.balance);
        
        // VIP Level
        if (elements.vip) {
            elements.vip.innerText = `VIP ${u.vip_level}`;
            // Optional: Change color based on level
            if (u.vip_level > 0) elements.vip.style.background = "linear-gradient(135deg, #ffd700, #f39c12)";
        }

        // User ID (UUID) - Show only first chunk
        if (elements.id) elements.id.innerText = `ID: ${u.id.split('-')[0]}`;

        // Referral Code
        if (elements.invite) elements.invite.innerText = u.referral_code;
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    ProfileController.init();
});