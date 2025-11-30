/**
 * 🔐 CASHFORGE SECURE AUTHENTICATION
 * Logic: Enforces Email Verification & Profile Creation
 */

import { supabase } from './supabase-client.js';
import { UI } from './ui.js'; // Assuming UI.showToast exists

export const Auth = {
    
    // --- 1. SIGN UP (With Verification) ---
    signUp: async (email, password, fullName) => {
        try {
            // 1. Register with Supabase Auth
            // We pass 'data' to store the Full Name in metadata immediately
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { full_name: fullName },
                    // Redirect URL after they click the email link
                    emailRedirectTo: window.location.origin + '/auth.html' 
                }
            });

            if (error) throw error;

            // 2. Check if session was created immediately (Auto-confirm enabled?)
            // If session is null, it means Email Verification is REQUIRED (Good).
            if (data.user && !data.session) {
                return { 
                    success: true, 
                    requiresVerification: true,
                    message: "Registration successful! Please check your email to verify your account." 
                };
            }

            // If we got here, maybe auto-confirm is on (Dev mode)
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
                // Custom error message for unverified emails
                if (error.message.includes("Email not confirmed")) {
                    throw new Error("Please verify your email address before logging in.");
                }
                throw error;
            }

            // Login Successful
            // Cache session token logic is handled automatically by Supabase SDK in localStorage
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
            
            // Clear any app-specific state if necessary
            localStorage.removeItem('cashforge_intro_seen'); // Optional: Keep or remove based on preference
            
            return { success: true };
        } catch (error) {
            console.error("SignOut Error:", error);
            return { success: false, message: error.message };
        }
    },

    // --- 4. SESSION MANAGEMENT ---
    
    // Get current active session (Token check)
    getSession: async () => {
        const { data } = await supabase.auth.getSession();
        return data.session;
    },

    // Get User Details
    getCurrentUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },
    
    // Check if user is authenticated, else redirect
    requireAuth: async () => {
        const session = await Auth.getSession();
        if (!session) {
            window.location.href = 'auth.html';
            return null;
        }
        return session.user;
    }
};