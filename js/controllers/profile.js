/* js/controllers/profile.js */
import { getCurrentUser, logout } from '../services/auth.js';
import { supabase } from '../config/supabase.js';
import { formatCurrency, maskEmail } from '../utils/formatters.js';
import { showToast } from '../utils/ui.js';

const ProfileController = {
    currentUser: null,

    // --- 1. INITIALIZE ---
    async init() {
        // A. Check Session
        const sessionUser = await getCurrentUser();
        if (!sessionUser) return; // Router handles redirect

        // B. Get Full Profile
        await this.loadProfile(sessionUser.id);
        
        if (this.currentUser) {
            this.renderProfile();
        }

        // C. Attach Logout Listener
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                // Use browser confirm as a final user check before executing logout
                const confirmed = confirm("Are you sure you want to log out?");
                if (!confirmed) return;
                
                // Show immediate feedback
                showToast("Logging out...", "info");
                
                await logout();
                // The logout function in auth.js handles the redirect to intro.html
            });
        }
    },

    // --- 2. LOAD DATA ---
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
            console.error("Error loading profile:", err);
            showToast("Failed to load profile details.", "error");
        }
    },

    // --- 3. RENDER DATA ---
    renderProfile() {
        const u = this.currentUser;
        if (!u) return;

        // IDs from profile.html
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
        if (elements.email) elements.email.innerText = maskEmail(u.email); // Use formatter to mask email
        
        // Balance
        if (elements.balance) elements.balance.innerText = formatCurrency(u.balance || 0);
        
        // VIP Level
        if (elements.vip) {
            const level = u.vip_level || 0;
            elements.vip.innerText = `VIP ${level}`;
            // Simple color logic for VIP status
            if (level > 0) {
                elements.vip.style.background = "linear-gradient(90deg, #ffc107, #f39c12)";
                elements.vip.style.color = "#fff";
                elements.vip.style.boxShadow = "0 2px 5px rgba(243, 156, 18, 0.5)";
            }
        }

        // User ID (UUID) - Show only first chunk
        if (elements.id) elements.id.innerText = `ID: ${u.id.split('-')[0]}`;

        // Referral Code
        if (elements.invite) elements.invite.innerText = u.referral_code || 'N/A';
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    ProfileController.init();
});
