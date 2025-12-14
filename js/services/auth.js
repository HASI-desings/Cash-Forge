/* Auth Service - CashForge
   Handles Login, Register, Logout, and Session Management.
*/

const AuthService = {
    
    // --- 1. REGISTER ---
    async register(email, password, fullName, referralCode) {
        try {
            console.log("Starting registration for:", email); // Debugging

            // CRITICAL: We pass 'options.data' containing full_name.
            // This is what the SQL Trigger looks for to create the user profile.
            const { data, error } = await window.sb.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,      // Must match SQL: new.raw_user_meta_data->>'full_name'
                        ref_code_used: referralCode // Saved in metadata for reference
                    }
                }
            });

            if (error) throw error;

            console.log("Auth User Created:", data.user?.id);

            // OPTIONAL: If the trigger didn't handle the referral link (upline_id),
            // we can try to do it manually here as a backup.
            if (referralCode && data.user) {
                await this.processReferral(data.user.id, referralCode);
            }

            return { success: true, session: data.session };

        } catch (err) {
            console.error("Registration Error:", err);
            // Return readable error messages
            return { success: false, message: err.message };
        }
    },

    // --- 2. LOGIN ---
    async login(email, password) {
        try {
            const { data, error } = await window.sb.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;
            return { success: true, session: data.session };

        } catch (err) {
            console.error("Login Error:", err);
            return { success: false, message: "Invalid email or password." };
        }
    },

    // --- 3. LOGOUT ---
    async logout() {
        await window.sb.auth.signOut();
        window.location.href = 'intro.html';
    },

    // --- 4. CHECK SESSION (Returns User or Null) ---
    async checkSession() {
        // We get the session directly from Supabase to see if user is logged in
        const { data: { session } } = await window.sb.auth.getSession();
        
        if (!session) {
            // If user is not logged in, redirect them to Intro (unless they are already on a public page)
            const path = window.location.pathname;
            const publicPages = ['login.html', 'register.html', 'intro.html', 'index.html'];
            
            // If current page is NOT public, kick them out
            let isPublic = false;
            publicPages.forEach(page => {
                if (path.includes(page)) isPublic = true;
            });

            if (!isPublic && path !== '/' && path !== '') {
                window.location.href = 'intro.html';
            }
            return null;
        }
        return session.user;
    },

    // --- 5. GET FULL PROFILE (Fetch from 'users' table) ---
    async getProfile() {
        const { data: { user } } = await window.sb.auth.getUser();
        if (!user) return null;

        const { data, error } = await window.sb
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
            
        if (error) {
            console.error("Profile Load Error:", error);
            return null;
        }
        return data;
    },

    // --- HELPER: Process Referral ---
    async processReferral(newUserId, code) {
        try {
            // 1. Find the owner of the referral code
            const { data: upline } = await window.sb
                .from('users')
                .select('id')
                .eq('referral_code', code) // Ensure your DB column is 'referral_code'
                .single();

            if (upline) {
                // 2. Link the new user to this upline
                await window.sb
                    .from('users')
                    .update({ upline_id: upline.id })
                    .eq('id', newUserId);
            }
        } catch (err) {
            console.warn("Referral processing failed (non-critical):", err);
        }
    }
};

// Expose globally so HTML pages can use 'AuthService.register()'
window.AuthService = AuthService;
