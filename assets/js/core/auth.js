/**
 * CashForge Authentication Handler (Supabase Integration)
 * Manages user sessions, registration, and route protection.
 * Dependencies: config.js, db.js, supabase.js
 */

const Auth = {
    
    // =================================
    // 1. REGISTRATION
    // =================================
    register: async function(name, email, password, confirmPass, refCode) {
        // 1. Basic Validation
        if (!name || !email || !password || password.length < 6 || password !== confirmPass) {
            return { success: false, msg: "Please ensure all fields are filled and passwords match (min 6 characters)." };
        }

        // 2. Register with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { full_name: name } // Store name metadata
            }
        });
        
        if (error) {
            return { success: false, msg: error.message };
        }
        
        const userId = data.user.id;

        // 3. Insert initial user profile into the 'users' table 
        // This links the new auth user to our custom profile data (balance, VIP status).
        const { error: profileError } = await supabase
            .from(TABLE_USERS)
            .insert({
                id: userId,
                name: name,
                email: email,
                balance: 0,
                vip_level: 0,
                uid: userId.substring(0, 8), // Unique ID for referral link (first 8 chars of UUID)
                referrer_uid: refCode || null,
            });

        if (profileError) {
            // Important: Log this profile error, but authentication succeeded.
            console.error("Profile creation failed, check RLS/Table structure:", profileError.message);
        }

        return { success: true, msg: "Account created successfully! Redirecting..." };
    },

    // =================================
    // 2. LOGIN
    // =================================
    login: async function(email, password) {
        if (!email || !password) return { success: false, msg: "Credentials required." };

        // Sign in using Supabase's standard method
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            return { success: false, msg: error.message };
        }
        
        return { success: true, msg: "Login successful!" };
    },

    // =================================
    // 3. SESSION MANAGEMENT & ROUTE PROTECTION
    // =================================
    
    /** Checks if a session token exists and is valid. */
    isAuthenticated: async function() {
        const { data } = await supabase.auth.getSession();
        return !!data.session;
    },

    /** Clears the current session and redirects to login. */
    logout: async function() {
        // Clear any local caches before signout
        localStorage.removeItem(CONFIG.STORAGE.USER_DATA);
        
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    },

    /** Guards internal pages, redirecting unauthenticated users to login. */
    checkProtection: async function() {
        const path = window.location.pathname;
        const publicPages = ['index.html', 'login.html', 'register.html', 'forgot-password.html'];
        
        // Determine if the current page is protected
        let isProtected = !publicPages.some(page => path.includes(page));

        // Check authentication status
        const authenticated = await this.isAuthenticated();

        // 1. If protected page but no session, redirect to login
        if (isProtected && !authenticated) {
            window.location.href = 'login.html';
            return;
        }
        
        // 2. If trying to access login/register while authenticated, redirect to dashboard
        if (!isProtected && authenticated && path.includes('login.html')) {
             window.location.href = 'dashboard.html';
        }
    }
};

// Auto-run protection check on page load
document.addEventListener('DOMContentLoaded', Auth.checkProtection);
