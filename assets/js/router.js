/**
 * 🚦 CASHFORGE ROUTER
 * Protects pages from unauthorized access.
 * Enforces strict redirection logic.
 */

import { supabase } from './supabase-client.js';

export const Router = {
    
    // Pages accessible WITHOUT logging in
    publicPages: ['index.html', 'intro.html', 'auth.html'],

    checkAccess: async () => {
        const path = window.location.pathname;
        // Extract filename (e.g., "profile.html") or default to index.html
        const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

        // --- 1. FAST CHECK (LocalStorage) ---
        // Check if ANY Supabase token exists locally for instant decision
        const hasLocalToken = Object.keys(localStorage).some(k => k.startsWith('sb-') && k.endsWith('-auth-token'));

        // LOGIC: If NO local token AND trying to access a RESTRICTED page -> Kick to index.html
        if (!hasLocalToken && !Router.publicPages.includes(page)) {
            console.warn("Router: No local session. Redirecting to Index.");
            window.location.replace('index.html');
            return; 
        }

        // --- 2. DEEP CHECK (Server Verification) ---
        // Verify the token is actually valid with Supabase
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            // User is NOT logged in
            if (!Router.publicPages.includes(page)) {
                // Trying to access private page -> Kick to index.html
                console.warn("Router: Invalid Session. Redirecting to Index.");
                window.location.replace('index.html');
            }
        } else {
            // User IS logged in
            // Trying to access public page (Auth/Intro) -> Kick to home.html
            if (Router.publicPages.includes(page)) {
                console.log("Router: User logged in. Redirecting to Home.");
                window.location.replace('home.html');
            }
        }
    }
};

// EXECUTE IMMEDIATELY
Router.checkAccess();
