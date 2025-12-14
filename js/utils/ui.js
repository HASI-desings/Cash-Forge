/* js/utils/router.js */
import { supabase } from '../config/supabase.js';

// Automatically execute when imported
(async function() {
    // 1. Define Public Pages (No Login Required)
    const publicPages = [
        'index.html',
        'intro.html', 
        'login.html', 
        'register.html'
    ];

    // 2. Get Current Filename
    const path = window.location.pathname;
    const page = path.split("/").pop() || 'index.html';

    // 3. Check if we are on a Public Page
    // We also treat the root path '/' as public
    const isPublic = publicPages.includes(page) || path === '/' || path.endsWith('/');

    // 4. Session Check
    // We use the imported supabase client directly (no waiting needed)
    const { data: { session } } = await supabase.auth.getSession();

    if (!isPublic) {
        // PRIVATE PAGE: If no session, Redirect to Intro
        if (!session) {
            console.warn("Unauthorized access. Redirecting...");
            window.location.href = 'intro.html';
        }
    } else {
        // PUBLIC PAGE: If session exists, Redirect to Dashboard
        // Only apply this auto-redirect on Login/Register pages to prevent looping on Intro
        if (session && (page === 'login.html' || page === 'register.html')) {
            window.location.href = 'home.html';
        }
    }
})();
