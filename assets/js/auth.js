/**
 * 🔐 CASHFORGE SECURE AUTHENTICATION
 * Logic: Enforces Email Verification & Profile Creation
 */

import { supabase } from './supabase-client.js';
// Removed UI import dependency to keep it cleaner, assumes UI is global or handled by caller

export const Auth = {
    
    // --- 1. SIGN UP (With Verification) ---
    signUp: async (email, password, fullName) => {
        try {
            // DYNAMIC REDIRECT URL
            // This grabs "https://cashforge.online" or "http://127.0.0.1:5500" automatically
            const redirectUrl = window.location.origin + '/auth.html';

            console.log("Sign Up Redirect URL:", redirectUrl); // Debugging

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { full_name: fullName },
                    emailRedirectTo: redirectUrl 
                }
            });

            if (error) throw error;

            if (data.user && !data.session) {
                return { 
                    success: true, 
                    requiresVerification: true,
                    message: "Registration successful! Please check your email to verify your account." 
                };
            }

            return { success: true, requiresVerification: false, user: data.user };

        } catch (error) {
            console.error("SignUp Error:", error);
            return { success: false, message: error.message };
        }
    },

    // --- 2. SIGN IN (Strict Check) ---
    signIn: async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                if (error.message.includes("Email not confirmed")) {
                    throw new Error("Please verify your email address before logging in.");
                }
                throw error;
            }

            return { success: true, user: data.user };

        } catch (error) {
            console.error("SignIn Error:", error);
            return { success: false, message: error.message };
        }
    },

    // --- 3. SIGN OUT ---
    signOut: async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            localStorage.removeItem('cashforge_intro_seen'); 
            return { success: true };
        } catch (error) {
            console.error("SignOut Error:", error);
            return { success: false, message: error.message };
        }
    },

    // --- 4. SESSION MANAGEMENT ---
    getSession: async () => {
        const { data } = await supabase.auth.getSession();
        return data.session;
    },

    getCurrentUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },
    
    requireAuth: async () => {
        const session = await Auth.getSession();
        if (!session) {
            window.location.href = 'auth.html';
            return null;
        }
        return session.user;
    }
};