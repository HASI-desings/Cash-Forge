/**
 * 🔐 CASHFORGE AUTHENTICATION MODULE
 * Handles Sign Up, Sign In, Sign Out, and Session Management.
 * Modified to support Referral Codes.
 */

import { supabase } from './supabase-client.js';

export const Auth = {
    
    // --- 1. SIGN UP ---
    // [UPDATED] Added refCode parameter to support referral system
    signUp: async (email, password, fullName, refCode = null) => {
        try {
            // 1. Create Auth User
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    // This metadata is accessible in SQL Triggers
                    data: { 
                        full_name: fullName,
                        referral_code: refCode 
                    } 
                }
            });

            if (error) throw error;

            // 2. Database Trigger usually handles profile creation.
            // However, we return the user data so the frontend can handle redirects or manual profile creation if needed.
            
            return { success: true, user: data.user };

        } catch (error) {
            console.error("SignUp Error:", error);
            return { success: false, message: error.message };
        }
    },

    // --- 2. SIGN IN ---
    signIn: async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            return { success: true, user: data.user };

        } catch (error) {
            console.error("SignIn Error:", error);
            return { success: false, message: "Invalid email or password." };
        }
    },

    // --- 3. SIGN OUT ---
    signOut: async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            // Clear any local state/cache if used
            localStorage.removeItem('cashforge_user_cache');
            
            return { success: true };
        } catch (error) {
            console.error("SignOut Error:", error);
            return { success: false, message: error.message };
        }
    },

    // --- 4. GET SESSION ---
    getSession: async () => {
        const { data } = await supabase.auth.getSession();
        return data.session;
    },

    // --- 5. GET CURRENT USER ---
    getCurrentUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // --- 6. PASSWORD RESET (Optional but good to have) ---
    resetPassword: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/settings.html',
        });
        return error ? { success: false, message: error.message } : { success: true };
    }
};
