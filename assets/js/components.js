/**
 * 🧩 REUSABLE COMPONENTS
 * Injects the Header and Bottom Navigation into pages automatically.
 * Ensures the Balance Display is always connected to the State.
 */

import { State } from './state.js';
import { Utils } from './utils.js';

export const Components = {
    
    // --- 1. RENDER HEADER ---
    renderHeader: () => {
        const header = document.createElement('header');
        header.className = 'gradient-bar fixed top-0 w-full z-50 h-[70px] flex items-center justify-between px-5 shadow-sm';
        
        header.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-cyan-500 shadow-lg shadow-cyan-200/50">
                    <!-- Logo Icon (Simplified for code) -->
                    <i class="ph-bold ph-lightning text-white text-xl"></i>
                </div>
                <div>
                    <span class="heading-font font-bold text-xl tracking-tight text-slate-800 leading-none block">CashForge</span>
                </div>
            </div>
            
            <!-- LIVE BALANCE DISPLAY -->
            <div class="glass-panel px-4 py-1.5 rounded-full flex items-center gap-2 border border-cyan-100 shadow-sm">
                <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span class="heading-font font-bold text-slate-800" id="global-header-balance">
                    ${Utils.formatCurrency(State.getBalance())}
                </span>
            </div>
        `;

        // Inject at the top of body
        document.body.prepend(header);
        
        // Start listening for balance changes immediately
        Components.setupBalanceListener();
    },

    // --- 2. RENDER BOTTOM NAV ---
    renderNav: (activePage) => {
        const nav = document.createElement('nav');
        nav.className = 'gradient-bar fixed bottom-0 w-full z-50 h-[80px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]';
        
        // Helper to generate nav items
        const item = (page, icon, label) => {
            const isActive = activePage === page ? 'active' : '';
            return `
                <a href="${page}.html" class="nav-item ${isActive} flex flex-col items-center group w-16">
                    <div class="nav-icon-box">
                        <i class="ph-bold ${icon} nav-icon"></i>
                    </div>
                    <span class="nav-text">${label}</span>
                </a>
            `;
        };

        nav.innerHTML = `
            <div class="flex justify-around items-end h-full max-w-lg mx-auto pb-4">
                ${item('home', 'ph-house', 'Home')}
                ${item('tasks', 'ph-list-checks', 'Tasks')}
                ${item('trade', 'ph-chart-line-up', 'Trade')}
                ${item('teams', 'ph-users-three', 'Team')}
                ${item('profile', 'ph-user-circle', 'Profile')}
            </div>
        `;

        document.body.appendChild(nav);
    },

    // --- 3. BALANCE LISTENER (The Logic You Asked For) ---
    setupBalanceListener: () => {
        // Listen for the custom event dispatched by state.js
        document.addEventListener('balance-updated', (event) => {
            const el = document.getElementById('global-header-balance');
            if (el) {
                // Update text
                el.innerText = Utils.formatCurrency(event.detail.balance);
                
                // Add a green pulse effect to show update
                el.parentElement.classList.add('ring-2', 'ring-green-400');
                setTimeout(() => el.parentElement.classList.remove('ring-2', 'ring-green-400'), 500);
            }
        });
    },

    // --- 4. INIT ---
    // Automatically detects which page is open based on URL
    init: () => {
        // Don't render on Auth or Intro pages
        const path = window.location.pathname;
        if (path.includes('auth.html') || path.includes('intro.html') || path.includes('index.html')) return;

        // Determine active page for Nav highlight
        let active = 'home';
        if (path.includes('tasks')) active = 'tasks';
        if (path.includes('trade')) active = 'trade';
        if (path.includes('teams')) active = 'teams';
        if (path.includes('profile') || path.includes('settings') || path.includes('history')) active = 'profile';

        // Render
        Components.renderHeader();
        Components.renderNav(active);
    }
};

// Auto-run when imported
document.addEventListener('DOMContentLoaded', Components.init);