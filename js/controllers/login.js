/* js/controllers/login.js */
import { login } from '../services/auth.js';
import { showToast } from '../utils/ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Expose handleLogin globally for the form's onsubmit attribute
    window.handleLogin = async (e) => {
        e.preventDefault();

        const emailEl = document.getElementById('email');
        const passwordEl = document.getElementById('password');
        const btn = document.getElementById('btn-submit');
        
        if (!emailEl || !passwordEl || !btn) return;

        const email = emailEl.value;
        const password = passwordEl.value;
        const originalText = 'LOGIN';

        // UI Loading State
        btn.innerHTML = 'Verifying...';
        btn.disabled = true;

        // Call Auth Service
        const response = await login(email, password);

        if (response.success) {
            showToast("Login Successful!", "success");
            
            // Slight delay for UX before redirecting
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1000);
        } else {
            // Use the standardized toast function
            showToast(response.message, "error");
            
            // Reset Button
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };
});
