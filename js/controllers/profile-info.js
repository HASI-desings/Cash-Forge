/* js/controllers/profile_info.js */
import { supabase } from '../config/supabase.js';
import { getCurrentUser } from '../services/auth.js';
import { formatDate } from '../utils/formatters.js';
import { showToast } from '../utils/ui.js';

const ProfileInfoController = {
    currentUser: null,

    // 1. Load Data on Init
    async init() {
        // Check Session
        const session = await getCurrentUser();
        if (!session) return;

        // Fetch Profile
        await this.fetchProfile(session.id);
        
        if (this.currentUser) {
            document.getElementById('full-name').value = this.currentUser.full_name || '';
            document.getElementById('email').value = this.currentUser.email;
            document.getElementById('join-date').value = formatDate(this.currentUser.created_at);
        }
    },

    async fetchProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error) throw error;
            this.currentUser = data;
        } catch (err) {
            console.error("Profile fetch error:", err);
            showToast("Failed to load user data.", "error");
        }
    },

    // 2. Update Logic
    async updateInfo(e) {
        e.preventDefault();
        
        const newName = document.getElementById('full-name').value;
        const btn = document.getElementById('btn-save');
        const originalText = 'Save Changes';

        if (!newName || newName.length < 2) {
            showToast("Full name is too short.", "error");
            return;
        }
        if (!this.currentUser) {
            showToast("User session error. Please log in again.", "error");
            return;
        }

        btn.innerText = "Saving...";
        btn.disabled = true;

        try {
            // Update 'users' table
            const { error } = await supabase
                .from('users')
                .update({ full_name: newName })
                .eq('id', this.currentUser.id);

            if (error) throw error;

            showToast("Profile Updated!", "success");
            
            // Optional: Return to profile after short delay
            setTimeout(() => {
               window.location.href = "profile.html"; 
            }, 1000);

        } catch (err) {
            console.error(err);
            showToast("Update failed.", "error");
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }
};

// Start and expose functions
document.addEventListener('DOMContentLoaded', () => {
    ProfileInfoController.init();
    // Expose updateInfo to the global window object for the form's onsubmit attribute
    window.updateInfo = (e) => ProfileInfoController.updateInfo(e);
});
