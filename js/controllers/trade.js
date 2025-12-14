/* js/controllers/trade.js */
import { supabase } from '../config/supabase.js';
import { getCurrentUser } from '../services/auth.js';
import { formatCurrency } from '../utils/formatters.js';
import { showToast } from '../utils/ui.js';

const TradeController = {
    currentUser: null,
    
    // State for the form
    state: {
        selectedRate: 1.5,
        selectedDays: 7,
        selectedName: "Weekly Booster"
    },

    // --- 1. INITIALIZE ---
    async init() {
        // A. Check Session
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            window.location.href = 'login.html';
            return;
        }

        // B. Get Profile (for Balance)
        await this.loadProfile(sessionUser.id);
        
        if (this.currentUser) {
            const balEl = document.getElementById('trade-balance');
            // Assuming header might handle this, but if page has specific balance display:
            if(balEl) balEl.innerText = formatCurrency(this.currentUser.balance);
        }

        // C. Check for Existing Active Trade
        await this.checkActiveTrade();

        // D. Attach Input Listeners
        this.attachListeners();
    },

    async loadProfile(userId) {
        const { data } = await supabase.from('users').select('*').eq('id', userId).single();
        this.currentUser = data;
    },

    // --- 2. CHECK ACTIVE TRADE ---
    async checkActiveTrade() {
        // Query investments where status is 'active'
        const { data, error } = await supabase
            .from('investments')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .eq('status', 'active')
            .single();

        // Note: Ensure your HTML has these IDs for the toggle logic to work
        const newTradeUI = document.getElementById('new-trade-ui');
        const activeTradeUI = document.getElementById('active-trade-ui');

        if (!newTradeUI || !activeTradeUI) return; // Guard if HTML is missing structure

        if (data) {
            // SHOW ACTIVE TRADE CARD
            newTradeUI.style.display = 'none';
            activeTradeUI.style.display = 'block';

            // Populate Data
            const nameEl = document.getElementById('at-plan-name');
            const amtEl = document.getElementById('at-amount');
            const profitEl = document.getElementById('at-profit');
            const daysEl = document.getElementById('at-days');

            if(nameEl) nameEl.innerText = data.plan_name;
            if(amtEl) amtEl.innerText = formatCurrency(data.amount);
            if(profitEl) profitEl.innerText = formatCurrency(data.daily_profit) + " / day";
            
            // Calculate Days Remaining
            const end = new Date(data.end_date);
            const now = new Date();
            const diffTime = end - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if(daysEl) daysEl.innerText = (diffDays > 0 ? diffDays : 0) + " Days Left";

        } else {
            // SHOW NEW TRADE FORM
            newTradeUI.style.display = 'block';
            activeTradeUI.style.display = 'none';
        }
    },

    // --- 3. EXECUTE TRADE ---
    async executeTrade() {
        const amountInput = document.getElementById('trade-amount'); // ID matches Mega HTML
        if (!amountInput) return;

        const amount = parseFloat(amountInput.value);
        const userBalance = parseFloat(this.currentUser.balance);

        // Validation
        if (!amount || amount <= 0) {
            showToast("Please enter a valid amount.", "error");
            return;
        }
        if (amount > userBalance) {
            showToast("Insufficient Balance! Deposit funds first.", "error");
            return;
        }

        if (!confirm(`Confirm investment of ${amount} PKR in ${this.state.selectedName}?`)) return;

        // UI Feedback
        const btn = document.querySelector('#trade-btn-container button');
        const originalText = btn ? btn.innerText : 'Confirm';
        if(btn) {
            btn.innerText = "Processing...";
            btn.disabled = true;
        }

        try {
            // 1. Deduct Balance
            const newBalance = userBalance - amount;
            const { error: balanceError } = await supabase
                .from('users')
                .update({ balance: newBalance })
                .eq('id', this.currentUser.id);

            if (balanceError) throw new Error("Balance update failed");

            // 2. Calculate End Date
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + this.state.selectedDays);

            // 3. Insert Investment Record
            const dailyProfit = amount * (this.state.selectedRate / 100);
            
            const { error: investError } = await supabase
                .from('investments')
                .insert([{
                    user_id: this.currentUser.id,
                    plan_name: this.state.selectedName,
                    amount: amount,
                    daily_profit: dailyProfit,
                    interest_rate: this.state.selectedRate,
                    duration_days: this.state.selectedDays,
                    end_date: endDate.toISOString(),
                    status: 'active'
                }]);

            if (investError) throw new Error("Investment record failed");

            // Success
            showToast("Trade Started Successfully!", "success");
            setTimeout(() => window.location.reload(), 1500);

        } catch (err) {
            console.error(err);
            showToast("Transaction Failed: " + err.message, "error");
            if(btn) {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        }
    },

    // --- 4. FORM LOGIC (Plan Selection & Math) ---
    // Matches logic from Mega HTML: selectStrategy(this, 1.5)
    // Extended to accept days/name for DB
    selectStrategy(element, rate, days = 7, name = 'Weekly Booster') {
        // UI Tabs
        document.querySelectorAll('.trade-banner').forEach(c => c.classList.remove('selected'));
        element.classList.add('selected');

        // Update State
        this.state.selectedRate = rate;
        if(days) this.state.selectedDays = days;
        if(name) this.state.selectedName = name;

        // Re-calculate
        this.updateCalculation();
    },

    updateCalculation() {
        const amountInput = document.getElementById('trade-amount');
        const val = parseFloat(amountInput.value);
        
        const btnContainer = document.getElementById('trade-btn-container');
        const calcBox = document.getElementById('profit-calculator');
        const profitVal = document.getElementById('calc-profit-val');
        const totalVal = document.getElementById('calc-total-val');

        const hasStrategy = document.querySelector('.trade-banner.selected');

        if (val > 0 && hasStrategy) {
            if(btnContainer) btnContainer.classList.remove('hidden');
            if(calcBox) calcBox.classList.remove('hidden');

            const daily = val * (this.state.selectedRate / 100);
            const totalProfit = daily * this.state.selectedDays;
            const totalReturn = val + totalProfit;

            if(profitVal) profitVal.innerText = totalProfit.toFixed(2);
            if(totalVal) totalVal.innerText = totalReturn.toFixed(2);
        } else {
            if(btnContainer) btnContainer.classList.add('hidden');
            if(calcBox) calcBox.classList.add('hidden');
        }
    },

    attachListeners() {
        const input = document.getElementById('trade-amount');
        if(input) {
            input.addEventListener('input', () => this.updateCalculation());
        }
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    TradeController.init();
    
    // Expose functions to window for HTML onclick events
    // Note: HTML must now pass (this, 1.5, 7, 'Weekly Booster') or we default inside function
    window.selectStrategy = (el, r, d, n) => TradeController.selectStrategy(el, r, d, n);
    
    // The Mega HTML uses a generic checkTradeInput, we override it or attach to button
    const confirmBtn = document.querySelector('#trade-btn-container button');
    if(confirmBtn) {
        confirmBtn.onclick = () => TradeController.executeTrade();
    }
});
