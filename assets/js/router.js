/**
 * 🚦 CASHFORGE ROUTER
 * Protects pages from unauthorized access.
 * Automatically kicks users to auth.html if they aren't logged in.
 */

import { supabase } from './supabase-client.js';

export const Router = {
    
    // Pages that DO NOT require login
    publicPages: ['index.html', 'intro.html', 'auth.html'],

    checkAccess: async () => {
        const path = window.location.pathname;
        // Extract filename (e.g., "profile.html" from "/CashForge/profile.html")
        const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

        // 1. FAST CHECK: LocalStorage
        // Supabase saves session as 'sb-<project-id>-auth-token'
        // We check if ANY supabase token exists in storage
        const hasLocalToken = Object.keys(localStorage).some(k => k.startsWith('sb-') && k.endsWith('-auth-token'));

        // If no local token AND trying to access a private page -> KICK OUT
        if (!hasLocalToken && !Router.publicPages.includes(page)) {
            console.warn("Router: No local token found. Redirecting to Auth.");
            window.location.replace('auth.html');
            return; 
        }

        // 2. DEEP CHECK: Verify with Supabase Server
        // This catches expired tokens or fake localStorage entries
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            // User is NOT logged in
            if (!Router.publicPages.includes(page)) {
                console.warn("Router: Invalid Session. Redirecting to Auth.");
                window.location.replace('auth.html');
            }
        } else {
            // User IS logged in
            // Prevent them from seeing Login/Intro pages again
            if (Router.publicPages.includes(page)) {
                window.location.replace('home.html');
            }
        }
    }
};

// EXECUTE IMMEDIATELY
Router.checkAccess();
