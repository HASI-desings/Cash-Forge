/* js/controllers/profile.js */
import { supabase } from '../config/supabase.js';
import { getCurrentUser, logout } from '../services/auth.js';
import { formatCurrency } from '../utils/formatters.js';

const ProfileController = {
    currentUser: null,

    // --- 1. INITIALIZE ---
    async init() {
        // A. Check Session
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            window.location.href = 'login.html';
            return;
        }

        // B. Get Full Profile
        await this.loadProfile(sessionUser.id);
        
        if (this.currentUser) {
            this.renderProfile();
        }

        // C. Attach Logout Listener
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await logout();
                window.location.href = 'intro.html';
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
        }
    },

    // --- 3. RENDER DATA ---
    renderProfile() {
        const u = this.currentUser;
        if (!u) return;

        // IDs must match your profile.html structure
        const elements = {
            name: document.getElementById('profile-name'),
            email: document.getElementById('profile-email'),
            balance: document.getElementById('profile-balance'),
            vip: document.getElementById('profile-vip'),
            id: document.getElementById('profile-id'),
            invite: document.getElementById('profile-invite')
        };

        // Helper to mask email (e.g., jo***@gmail.com)
        const maskEmail = (email) => {
            if (!email) return '';
            const [name, domain] = email.split('@');
            if (name.length <= 2) return email;
            return `${name.substring(0, 2)}***@${domain}`;
        };

        // Update Text Content
        if (elements.name) elements.name.innerText = u.full_name || 'CashForge User';
        if (elements.email) elements.email.innerText = maskEmail(u.email);
        
        // Balance
        if (elements.balance) elements.balance.innerText = formatCurrency(u.balance);
        
        // VIP Level
        if (elements.vip) {
            elements.vip.innerText = `VIP ${u.vip_level}`;
            // Optional: Change color based on level
            if (u.vip_level > 0) {
                elements.vip.style.background = "linear-gradient(135deg, #ffd700, #f39c12)";
                elements.vip.style.color = "#fff";
                elements.vip.style.padding = "2px 8px";
                elements.vip.style.borderRadius = "10px";
            }
        }

        // User ID (UUID) - Show only first chunk for brevity
        if (elements.id) elements.id.innerText = `ID: ${u.id.split('-')[0]}`;

        // Referral Code
        if (elements.invite) elements.invite.innerText = u.referral_code || '---';
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    ProfileController.init();
});
