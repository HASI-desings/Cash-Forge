/* js/services/auth.js */
import { supabase } from '../config/supabase.js';

// --- 1. REGISTER ---
export async function register(email, password, fullName, referralCode) {
    try {
        console.log("Starting registration for:", email);

        // Sign Up with Metadata
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,       // Saved to raw_user_meta_data
                    ref_code_used: referralCode 
                }
            }
        });

        if (error) throw error;

        // Manual Referral Processing (Backup for SQL Triggers)
        if (referralCode && data.user) {
            await processReferral(data.user.id, referralCode);
        }

        return { success: true, session: data.session };

    } catch (err) {
        console.error("Registration Error:", err);
        return { success: false, message: err.message };
    }
}

// --- 2. LOGIN ---
export async function login(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;
        return { success: true, session: data.session };

    } catch (err) {
        console.error("Login Error:", err);
        return { success: false, message: "Invalid email or password." };
    }
}

// --- 3. LOGOUT ---
export async function logout() {
    await supabase.auth.signOut();
    window.location.href = 'intro.html';
}

// --- 4. GET CURRENT USER (Session Check & Protection) ---
export async function getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        // Page Protection Logic
        const path = window.location.pathname;
        const publicPages = ['login.html', 'register.html', 'intro.html', 'index.html', '/'];
        
        let isPublic = false;
        publicPages.forEach(page => {
            if (path.endsWith(page) || path === '/') isPublic = true;
        });

        // If not public, redirect to start
        if (!isPublic) {
            window.location.href = 'intro.html';
        }
        return null;
    }
    return session.user;
}

// --- HELPER: Process Referral ---
async function processReferral(newUserId, code) {
    try {
        // 1. Find the owner of the referral code
        const { data: upline } = await supabase
            .from('users')
            .select('id')
            .eq('referral_code', code)
            .single();

        if (upline) {
            // 2. Link the new user to this upline
            await supabase
                .from('users')
                .update({ upline_id: upline.id })
                .eq('id', newUserId);
        }
    } catch (err) {
        console.warn("Referral processing failed (non-critical):", err);
    }
}
