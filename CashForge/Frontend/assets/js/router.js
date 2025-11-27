/**
 * 🚦 CASHFORGE ROUTER
 * Protects pages from unauthorized access.
 * Redirects users based on their session state.
 */

import { Auth } from './auth.js';

export const Router = {
    
    // List of pages that do NOT require login
    publicPages: ['index.html', 'intro.html', 'auth.html'],

    checkAccess: async () => {
        // 1. Identify current page
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html'; // Default to index if root

        // 2. Check Session
        // We use a lighter check first (localStorage) for speed to prevent "flashing",
        // then verify with Supabase if needed.
        const session = await Auth.getSession();

        // 3. Logic Gate
        if (!session) {
            // User is Guest
            if (!Router.publicPages.includes(page)) {
                console.warn("Router: Unauthorized access. Redirecting to Auth.");
                window.location.href = 'auth.html';
            }
        } else {
            // User is Logged In
            if (Router.publicPages.includes(page)) {
                // Don't let logged-in users see the Intro/Auth pages again
                console.log("Router: User already logged in. Redirecting to Home.");
                window.location.href = 'home.html';
            }
        }
    }
};

// Execute immediately when imported
Router.checkAccess();