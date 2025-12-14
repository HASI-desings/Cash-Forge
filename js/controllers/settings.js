/* js/controllers/settings.js */
import { supabase } from '../config/supabase.js';
import { getCurrentUser } from '../services/auth.js';
import { showToast } from '../utils/ui.js';

const SettingsController = {
    currentUser: null,

    // --- 1. INITIALIZE ---
    async init() {
        // A. Check Session
        const sessionUser = await getCurrentUser();
        if (!sessionUser) return;
        
        // B. Load Current User Profile
        await this.loadProfile(sessionUser.id);
        
        // C. Attach Form Listeners
        document.getElementById('form-wallet').onsubmit = (e) => this.handleSaveWallet(e);
        document.getElementById('form-password').onsubmit = (e) => this.handleUpdatePassword(e);
        
        // D. Render Saved Wallets (Optional)
        this.renderSavedWallets();
    },

    async loadProfile(userId) {
        const { data } = await supabase.from('users').select('*').eq('id', userId).single();
        this.currentUser = data;
    },

    // --- 2. WALLET CONFIGURATION LOGIC ---
    async handleSaveWallet(e) {
        e.preventDefault();
        
        const labelEl = document.getElementById('wallet-label');
        const addressEl = document.getElementById('wallet-address');
        const btn = e.submitter;
        
        if (!labelEl || !addressEl || !this.currentUser) return;

        const label = labelEl.value.trim() || 'USDT Wallet';
        const address = addressEl.value.trim();
        const originalText = 'Save Wallet';

        if (address.length < 10) {
            return showToast("Please enter a valid wallet address (TRC20/BEP20).", "error");
        }
        
        if(btn) {
            btn.innerText = "Saving...";
            btn.disabled = true;
        }

        try {
            // Insert or Update user_wallets table
            const { error } = await supabase
                .from('user_wallets')
                .insert([{
                    user_id: this.currentUser.id,
                    wallet_address: address,
                    label: label,
                    network: 'TRC20' // Assume TRC20 unless specified otherwise
                }]);

            if (error) throw error;
            
            showToast("Wallet saved successfully!", "success");
            
            // Clear inputs after success
            labelEl.value = '';
            addressEl.value = '';

            this.renderSavedWallets(); // Refresh list immediately
            
        } catch (err) {
            console.error(err);
            showToast(`Error saving wallet: ${err.message}`, "error");
        } finally {
            if(btn) {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        }
    },

    // --- 3. PASSWORD UPDATE LOGIC ---
    async handleUpdatePassword(e) {
        e.preventDefault();
        
        const newPasswordEl = document.getElementById('new-password');
        const btn = e.submitter;
        
        if (!newPasswordEl) return;
        
        const newPassword = newPasswordEl.value;
        const originalText = 'Update Password';

        if (newPassword.length < 6) {
            return showToast("Password must be at least 6 characters.", "error");
        }
        
        if(btn) {
            btn.innerText = "Updating...";
            btn.disabled = true;
        }

        try {
            // Supabase Auth update (requires re-authentication if session is old)
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            
            showToast("Password updated successfully!", "success");
            newPasswordEl.value = '';
            
        } catch (err) {
            console.error(err);
            showToast(`Error updating password. Try logging in again.`, "error");
        } finally {
            if(btn) {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        }
    },
    
    // --- 4. RENDER SAVED WALLETS (Placeholder) ---
    async renderSavedWallets() {
        // This is a placeholder section. In the actual HTML, you would 
        // dynamically generate a list of saved wallets here.
        
        const { data: wallets } = await supabase
            .from('user_wallets')
            .select('*')
            .eq('user_id', this.currentUser.id);
            
        const section = document.querySelector('.settings-section');
        if (!section || !wallets || wallets.length === 0) return;

        // Example: Add a simple list display above the form
        let html = '<h6 class="section-title" style="color: #008b8b;">SAVED WALLETS</h6><div style="margin-bottom: 15px; background: #fff; padding: 10px; border-radius: 8px;">';
        
        wallets.forEach(w => {
            html += `<p style="font-size: 12px; margin: 5px 0;">
                <i data-lucide="check-circle" style="width:12px; color:green;"></i> 
                ${w.label}: <code>${w.wallet_address.substring(0, 6)}...</code>
            </p>`;
        });
        html += '</div>';

        // Check if list already exists, otherwise prepend it
        let listEl = document.getElementById('saved-wallets-list');
        if (listEl) {
            listEl.innerHTML = html;
        } else {
            listEl = document.createElement('div');
            listEl.id = 'saved-wallets-list';
            listEl.innerHTML = html;
            
            // Find the form and insert the list right before it
            const form = document.getElementById('form-wallet');
            if(form) form.before(listEl);
        }

        // Re-init lucide icons if available
        if (window.lucide) window.lucide.createIcons();
    }
};

// Start the controller
document.addEventListener('DOMContentLoaded', () => {
    SettingsController.init();
});
