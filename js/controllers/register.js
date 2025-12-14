/* js/controllers/register.js */
import { register } from '../services/auth.js';
import { showToast } from '../utils/ui.js';

const RegisterController = {
    // 1. Auto-fill Referral Code from URL
    init() {
        // Check for ?ref=CODE in URL
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        
        const input = document.getElementById('referral-code');
        if (refCode && input) {
            input.value = refCode;
            input.readOnly = true; // Lock it if it came from a link
            input.style.background = "#f0fdf4"; // Light green hint (Assuming CSS variable is defined)
            showToast(`Registered via referral link: ${refCode}`, "info");
        }
    },

    // 2. Handle Form Submit
    async handleRegister(e) {
        e.preventDefault();

        const fullName = document.getElementById('full-name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const referralCode = document.getElementById('referral-code').value;
        const btn = document.getElementById('btn-submit');
        const originalText = 'CREATE ACCOUNT';

        // Basic validation check (input required/minlength attributes handle most)
        if (!fullName || !email || !password) {
            showToast("Please fill all required fields.", "error");
            return;
        }

        // UI Loading
        btn.innerHTML = 'Creating Account...';
        btn.disabled = true;

        // Call Auth Service
        // Note: register(email, password, fullName, referralCode)
        const response = await register(email, password, fullName, referralCode);

        if (response.success) {
            showToast("Registration Successful!", "success");
            
            setTimeout(() => {
                // If session exists (auto-login), redirect to Home, otherwise Login
                if (response.session) {
                    window.location.href = 'home.html';
                } else {
                    // Usually means email confirmation is ON
                    showToast("Please check your email to confirm your account.", "warning");
                    window.location.href = 'login.html';
                }
            }, 1500);

        } else {
            showToast(response.message, "error");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
};

// Start and expose functions
document.addEventListener('DOMContentLoaded', () => {
    RegisterController.init();
    // Expose handleRegister to the global window object for the form's onsubmit attribute
    window.handleRegister = (e) => RegisterController.handleRegister(e);
});
