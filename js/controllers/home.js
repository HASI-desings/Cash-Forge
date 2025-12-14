/* js/controllers/home.js */
import { supabase } from '../config/supabase.js';
import { getCurrentUser } from '../services/auth.js'; 
import { formatCurrency } from '../utils/formatters.js';

const HomeController = {
    
    // --- 1. INITIALIZE ---
    async init() {
        // A. Security Check
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            window.location.href = 'login.html';
            return;
        }

        // B. Load User Data
        this.loadUserProfile(sessionUser.id);

        // C. UI Setup
        this.initSlider();
        this.attachPackageListeners();
    },

    // --- 2. LOAD USER PROFILE ---
    async loadUserProfile(userId) {
        try {
            // Fetch profile directly from Supabase 'users' table
            const { data: profile, error } = await supabase
                .from('users')
                .select('full_name, balance, vip_level')
                .eq('id', userId)
                .single();

            if (error) throw error;
            
            if (profile) {
                // Update Name
                const nameEl = document.getElementById('user-name');
                if(nameEl) nameEl.innerText = profile.full_name || 'User';

                // Update Balance
                const balEl = document.getElementById('user-balance');
                if(balEl) balEl.innerText = formatCurrency(profile.balance);

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
            document.querySelectorAll('.pkg-header').forEach(header => {
                const details = header.nextElementSibling;
                if (header !== element && details) {
                    details.classList.remove('open');
                }
            });

            // 2. Toggle clicked package
            const details = element.nextElementSibling;
            if(details) details.classList.toggle('open');
        };

        // Handle "Invest Now" button clicks inside packages
        window.goToTrade = (packageName) => {
            // Save selection to LocalStorage to pre-fill Trade page
            localStorage.setItem('selected_plan', packageName);
            window.location.href = 'trade.html';
        };
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    HomeController.init();
});
