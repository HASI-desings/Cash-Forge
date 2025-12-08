/**
 * 🧩 REUSABLE COMPONENTS
 * Injects the Header and Bottom Navigation into pages automatically.
 * Modified to ensure Balance updates catch both initial load and dynamic changes.
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
                    <i class="ph-bold ph-lightning text-white text-xl"></i>
                </div>
                <div>
                    <span class="heading-font font-bold text-xl tracking-tight text-slate-800 leading-none block">CashForge</span>
                </div>
            </div>
            
            <div class="glass-panel px-4 py-1.5 rounded-full flex items-center gap-2 border border-cyan-100 shadow-sm transition-all duration-300" id="balance-container">
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

    // --- 3. BALANCE LISTENER [MODIFIED] ---
    setupBalanceListener: () => {
        // Internal helper to update UI and trigger pulse
        const updateDisplay = (newBalance) => {
            const el = document.getElementById('global-header-balance');
            const container = document.getElementById('balance-container');
            
            if (el && container) {
                el.innerText = Utils.formatCurrency(newBalance);
                
                // Add visual pulse effect
                container.classList.add('ring-2', 'ring-green-400', 'bg-green-50');
                setTimeout(() => {
                    container.classList.remove('ring-2', 'ring-green-400', 'bg-green-50');
                }, 500);
            }
        };

        // 1. Listen for DYNAMIC updates (Tasks, Trades completed)
        document.addEventListener('balance-updated', (event) => {
            updateDisplay(event.detail.balance);
        });

        // 2. [NEW] Listen for INITIAL LOAD (When DB fetch completes)
        // This ensures the 0 changes to the real balance on page load
        document.addEventListener('state-ready', () => {
            updateDisplay(State.getBalance());
        });
    },

    // --- 4. INIT ---
    init: () => {
        const path = window.location.pathname;
        if (path.includes('auth.html') || path.includes('intro.html') || path.includes('index.html')) return;

        let active = 'home';
        if (path.includes('tasks')) active = 'tasks';
        if (path.includes('trade')) active = 'trade';
        if (path.includes('teams')) active = 'teams';
        if (path.includes('profile') || path.includes('settings') || path.includes('history')) active = 'profile';

        Components.renderHeader();
        Components.renderNav(active);
    }
};

// Auto-run when imported
document.addEventListener('DOMContentLoaded', Components.init);
