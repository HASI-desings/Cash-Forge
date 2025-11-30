/**
 * 🚦 CASHFORGE ROUTER
 */

import { Auth } from './auth.js';

export const Router = {
    
    publicPages: ['index.html', 'intro.html', 'auth.html'],

    checkAccess: async () => {
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

        // 1. Check Session
        const session = await Auth.getSession();

        // 2. Logic Gate
        if (!session) {
            // If user is NOT logged in, but trying to access a protected page
            if (!Router.publicPages.includes(page)) {
                console.warn("Router: Access Denied. Redirecting to Auth.");
                window.location.href = 'auth.html';
            }
        } else {
            // If user IS logged in, but trying to access Login/Intro
            if (Router.publicPages.includes(page)) {
                window.location.href = 'home.html';
            }
        }
    }
};

Router.checkAccess();
