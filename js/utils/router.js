/* Router Utility - CashForge
   Automatically protects private pages from unauthorized access.
   
   Usage: Include this script in the <head> of your protected pages 
   AFTER auth.js.
*/

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
    const isPublic = publicPages.includes(page);

    // 4. Session Check
    // We wait for Supabase to initialize
    const checkAuth = async () => {
        // Wait up to 2 seconds for window.sb to be ready
        let attempts = 0;
        while (!window.sb && attempts < 20) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }

        if (!window.sb) {
            console.error("Router: Supabase not initialized.");
            return;
        }

        const { data: { session } } = await window.sb.auth.getSession();

        if (!isPublic) {
            // PRIVATE PAGE: If no session, Redirect to Intro
            if (!session) {
                console.warn("Unauthorized access. Redirecting...");
                window.location.href = 'intro.html';
            }
        } else {
            // PUBLIC PAGE: If session exists, Redirect to Dashboard (Optional UX)
            // We usually don't force this on 'index.html' to allow loading animation,
            // but for Login/Register it's nice to auto-forward.
            if (session && (page === 'login.html' || page === 'register.html')) {
                window.location.href = 'home.html';
            }
        }
    };

    // Execute
    checkAuth();

})();