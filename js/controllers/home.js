/* Home Controller - CashForge
   Handles Dashboard logic:
   1. Fetches User Profile (Balance/Name).
   2. Runs the Banner Slider.
   3. Manages Package List (Expand/Collapse).
*/

const HomeController = {
    
    // --- 1. INITIALIZE ---
    async init() {
        // A. Security Check
        const sessionUser = await AuthService.checkSession();
        if (!sessionUser) return;

        // B. Load User Data
        this.loadUserProfile(sessionUser.id);

        // C. UI Setup
        this.initSlider();
        this.attachPackageListeners();
    },

    // --- 2. LOAD USER PROFILE ---
    async loadUserProfile(userId) {
        try {
            // We use the helper from AuthService (or fetch direct)
            const profile = await AuthService.getProfile();
            
            if (profile) {
                // Update Name
                const nameEl = document.getElementById('user-name');
                if(nameEl) nameEl.innerText = profile.full_name || 'User';

                // Update Balance
                const balEl = document.getElementById('user-balance');
                if(balEl) balEl.innerText = Formatters.currency(profile.balance);

                // Update VIP Badge
                const vipEl = document.getElementById('vip-badge');
                if(vipEl) vipEl.innerText = `VIP ${profile.vip_level}`;
            }
        } catch (err) {
            console.error("Failed to load profile", err);
        }
    },

    // --- 3. BANNER SLIDER LOGIC ---
    initSlider() {
        const track = document.querySelector('.slider-track');
        if (!track) return;

        let index = 0;
        const slides = track.children;
        const totalSlides = slides.length;

        // Auto Scroll every 4 seconds
        setInterval(() => {
            index++;
            if (index >= totalSlides) index = 0;
            
            const translateVal = index * -100;
            track.style.transform = `translateX(${translateVal}%)`;
        }, 4000);
    },

    // --- 4. PACKAGE ACCORDION (Envelope Effect) ---
    attachPackageListeners() {
        // Expose the toggle function to window so HTML can call it
        window.togglePackage = (element) => {
            // 1. Close all other packages
            document.querySelectorAll('.package-item').forEach(item => {
                if (item !== element) {
                    item.classList.remove('open');
                }
            });

            // 2. Toggle clicked package
            element.classList.toggle('open');
        };

        // Handle "Invest Now" button clicks inside packages
        window.goToTrade = (packageName, rate, days) => {
            // Save selection to URL or LocalStorage to pre-fill Trade page
            // For now, we simply redirect
            window.location.href = `trade.html?plan=${encodeURIComponent(packageName)}`;
        };
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    HomeController.init();
});