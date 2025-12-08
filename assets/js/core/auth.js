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
        if (!name || !email || !password || password !== confirmPass) {
            return { success: false, msg: "Please fill all required fields and ensure passwords match." };
        }

        // 2. Register with Supabase Auth
        // Supabase automatically creates the user record in auth.users
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { full_name: name } // Optional metadata
            }
        });
        
        if (error) {
            return { success: false, msg: error.message };
        }

        // 3. Insert initial user profile into the 'users' table (required for balance/team)
        // This is necessary because Supabase Auth handles email/pass, but a custom 'users' table holds profile data.
        const { error: profileError } = await supabase
            .from(TABLE_USERS)
            .insert({
                id: data.user.id,
                name: name,
                email: email,
                balance: 0, // Initial balance
                vip_level: 0,
                referrer_uid: refCode || null, // Stores the referral code/UID
            });

        if (profileError) {
            // Log this error but proceed, as the user can still log in (auth succeeded).
            console.error("Profile creation failed:", profileError.message);
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
    // 3. SESSION MANAGEMENT
    // =================================
    
    /** Checks if a session token exists and is valid. */
    isAuthenticated: async function() {
        const { data } = await supabase.auth.getSession();
        return !!data.session;
    },

    /** Clears the current session and redirects to login. */
    logout: async function() {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    },

    // =================================
    // 4. ROUTE PROTECTION
    // =================================
    
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