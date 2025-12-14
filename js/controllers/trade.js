/* js/controllers/trade.js */
import { supabase } from '../config/supabase.js';
import { getCurrentUser } from '../services/auth.js';
import { formatCurrency } from '../utils/formatters.js';
import { showToast } from '../utils/ui.js';

const strategies = [
    { name: 'Weekly Booster', rate: 1.5, days: 7 },
    { name: 'Fortnight Blast', rate: 1.7, days: 15 },
    { name: 'Monthly Mega', rate: 2.0, days: 30 },
    { name: 'Quarter Plus', rate: 2.5, days: 120 },
    { name: 'Annual Gala', rate: 3.0, days: 200 } // Added all required strategies
];

const TradeController = {
    currentUser: null,
    userBalance: 0,
    selectedStrategy: strategies[0], // Default selection

    // --- 1. INITIALIZE ---
    async init() {
        const sessionUser = await getCurrentUser();
        if (sessionUser) {
            await this.loadUserProfile(sessionUser.id);
        } else {
            // Set default balance if not logged in
            document.getElementById('display-balance').innerText = formatCurrency(0);
        }

        this.renderStrategies();
        this.attachListeners();
        this.calculate(); // Initial calculation on load
    },

    // --- 2. LOAD USER PROFILE & BALANCE ---
    async loadUserProfile(userId) {
        try {
            const { data: profile, error } = await supabase
                .from('users')
                .select('balance')
                .eq('id', userId)
                .single();

            if (error) throw error;
            
            if (profile) {
                this.userBalance = profile.balance || 0;
            }
            // Update balance display in header
            const balEl = document.getElementById('display-balance');
            if (balEl) balEl.innerText = formatCurrency(this.userBalance);
            
        } catch (err) {
            console.error("Failed to load profile balance", err);
        }
    },

    // --- 3. RENDER STRATEGIES ---
    renderStrategies() {
        const container = document.getElementById('strategy-list');
        if (!container) return;

        container.innerHTML = '';
        strategies.forEach((s, i) => {
            const div = document.createElement('div');
            // Check if this is the first strategy for initial selection
            div.className = `strategy-banner ${i === 0 ? 'selected' : ''}`;
            
            // Note: We expose selectStrategy globally for HTML onclick
            div.onclick = () => window.selectStrategy(i, div);

            div.innerHTML = `
                <div class="strat-info">
                    <h4>${s.name}</h4>
                    <span>${s.days} Days</span>
                </div>
                <div class="rate-val">${s.rate}%</div>
            `;
            container.appendChild(div);
        });
        
        // Expose selectStrategy globally
        window.selectStrategy = this.selectStrategy.bind(this);
    },

    // --- 4. SELECT STRATEGY LOGIC ---
    selectStrategy(index, el) {
        // Update UI
        document.querySelectorAll('.strategy-banner').forEach(d => d.classList.remove('selected'));
        el.classList.add('selected');
        
        // Update State
        this.selectedStrategy = strategies[index];
        this.calculate(); // Recalculate based on new strategy
    },

    // --- 5. CALCULATOR LOGIC (Dynamic) ---
    calculate() {
        const input = document.getElementById('invest-amount');
        const resArea = document.getElementById('results-area');
        const btn = document.getElementById('btn-invest');

        if (!input || !resArea || !btn) return;

        const val = parseFloat(input.value);
        const minInvestment = 1000;

        if (!val || val < minInvestment) {
            resArea.classList.remove('active');
            btn.style.display = 'none';
            // Set placeholder back to 0.00
            document.getElementById('daily-profit').innerText = formatCurrency(0, 'PKR');
            document.getElementById('total-return').innerText = formatCurrency(0, 'PKR');
            return;
        }
        
        resArea.classList.add('active');
        btn.style.display = 'block';

        const { rate, days } = this.selectedStrategy;
        
        const dailyProfit = val * (rate / 100);
        const totalProfit = dailyProfit * days;
        const totalReturn = val + totalProfit;
        
        document.getElementById('daily-profit').innerText = formatCurrency(dailyProfit, 'PKR');
        document.getElementById('total-return').innerText = formatCurrency(totalReturn, 'PKR');
    },

    // --- 6. ATTACH LISTENERS ---
    attachListeners() {
        const input = document.getElementById('invest-amount');
        const btn = document.getElementById('btn-invest');

        if (input) input.addEventListener('input', this.calculate.bind(this));
        if (btn) btn.onclick = () => this.submitTrade();
        
        // Expose submitTrade globally for HTML onclick (if needed)
        window.submitTrade = this.submitTrade.bind(this);
    },

    // --- 7. TRADE EXECUTION ---
    async submitTrade() {
        const input = document.getElementById('invest-amount');
        const amount = parseFloat(input.value);
        const btn = document.getElementById('btn-invest');
        const originalText = 'Start Investment';
        
        // Check for active trade (Placeholder - needs checkActiveTrade logic)
        // If (await this.checkActiveTrade()) { return showToast("You already have an active trade.", "error"); }

        // Validation
        if (amount < 1000) {
            return showToast('Minimum investment is PKR 1000', 'error');
        }
        if (amount > this.userBalance) {
            return showToast(`Insufficient Balance. You have ${formatCurrency(this.userBalance)}`, 'error');
        }

        if (!confirm(`Confirm investment of ${formatCurrency(amount)} in ${this.selectedStrategy.name}?`)) return;

        btn.innerText = 'Processing...';
        btn.disabled = true;

        try {
            // 1. Deduct Balance
            const newBalance = this.userBalance - amount;
            await supabase.from('users').update({ balance: newBalance }).eq('id', this.currentUser.id);

            // 2. Insert Investment Record
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + this.selectedStrategy.days);

            await supabase
                .from('investments')
                .insert([{
                    user_id: this.currentUser.id,
                    plan_name: this.selectedStrategy.name,
                    amount: amount,
                    daily_profit: amount * (this.selectedStrategy.rate / 100),
                    duration_days: this.selectedStrategy.days,
                    end_date: endDate.toISOString(),
                    status: 'active'
                }]);

            showToast(`Trade Started Successfully in ${this.selectedStrategy.name}!`, 'success');
            setTimeout(() => window.location.reload(), 1500);

        } catch (err) {
            console.error("Trade Submission Error:", err);
            showToast("Transaction Failed due to network error.", 'error');
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    TradeController.init();
});
