/* Trade Controller - CashForge
   Handles chart rendering, investment calculations, and trade execution.
   Enforces "One Active Trade" rule via Supabase check.
*/

const TradeController = {
    currentUser: null,
    chartInstance: null,
    
    // State for the form
    state: {
        selectedRate: 1.5,
        selectedDays: 7,
        selectedName: "Weekly Booster"
    },

    // --- 1. INITIALIZE ---
    async init() {
        // A. Check Session
        const sessionUser = await AuthService.checkSession();
        if (!sessionUser) return;

        // B. Get Profile (for Balance)
        this.currentUser = await AuthService.getProfile();
        if (this.currentUser) {
            document.getElementById('trade-balance').innerText = Formatters.currency(this.currentUser.balance);
        }

        // C. Check for Existing Active Trade
        await this.checkActiveTrade();

        // D. Initialize Chart
        this.initChart();
        
        // E. Attach Input Listeners
        this.attachListeners();
    },

    // --- 2. CHECK ACTIVE TRADE ---
    async checkActiveTrade() {
        // Query investments where status is 'active'
        const { data, error } = await window.sb
            .from('investments')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .eq('status', 'active')
            .single(); // We expect max 1 due to logic

        const newTradeUI = document.getElementById('new-trade-ui');
        const activeTradeUI = document.getElementById('active-trade-ui');

        if (data) {
            // SHOW ACTIVE TRADE CARD
            newTradeUI.style.display = 'none';
            activeTradeUI.style.display = 'block';

            // Populate Data
            document.getElementById('at-plan-name').innerText = data.plan_name;
            document.getElementById('at-amount').innerText = Formatters.currency(data.amount);
            document.getElementById('at-profit').innerText = Formatters.currency(data.daily_profit);
            
            // Calculate Days Remaining
            const end = new Date(data.end_date);
            const now = new Date();
            const diffTime = Math.abs(end - now);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            document.getElementById('at-days').innerText = (diffDays > 0 ? diffDays : 0) + " Days";

        } else {
            // SHOW NEW TRADE FORM
            newTradeUI.style.display = 'block';
            activeTradeUI.style.display = 'none';
        }
    },

    // --- 3. EXECUTE TRADE ---
    async executeTrade() {
        const amountInput = document.getElementById('invest-amount');
        const amount = parseFloat(amountInput.value);
        const userBalance = parseFloat(this.currentUser.balance);

        // Validation
        if (!amount || amount <= 0) {
            UI.toast("Please enter a valid amount.", "error");
            return;
        }
        if (amount > userBalance) {
            UI.toast("Insufficient Balance! Deposit funds first.", "error");
            return;
        }

        if (!confirm(`Confirm investment of ${amount} USDT in ${this.state.selectedName}?`)) return;

        // UI Feedback
        const btn = document.getElementById('btn-invest');
        btn.innerText = "Processing...";
        btn.disabled = true;

        try {
            // 1. Deduct Balance
            const newBalance = userBalance - amount;
            const { error: balanceError } = await window.sb
                .from('users')
                .update({ balance: newBalance })
                .eq('id', this.currentUser.id);

            if (balanceError) throw new Error("Balance update failed");

            // 2. Calculate End Date
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + this.state.selectedDays);

            // 3. Insert Investment Record
            const dailyProfit = amount * (this.state.selectedRate / 100);
            
            const { error: investError } = await window.sb
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
            UI.toast("Trade Started Successfully!", "success");
            setTimeout(() => window.location.reload(), 1500);

        } catch (err) {
            console.error(err);
            UI.toast("Transaction Failed: " + err.message, "error");
            btn.innerText = "START TRADE";
            btn.disabled = false;
        }
    },

    // --- 4. FORM LOGIC (Plan Selection & Math) ---
    selectPlan(element, rate, days, name) {
        // UI Tabs
        document.querySelectorAll('.plan-chip').forEach(c => c.classList.remove('active'));
        element.classList.add('active');

        // Update State
        this.state.selectedRate = rate;
        this.state.selectedDays = days;
        this.state.selectedName = name;

        // Re-calculate
        this.updateCalculation();
    },

    updateCalculation() {
        const amountInput = document.getElementById('invest-amount');
        const val = parseFloat(amountInput.value);
        
        const btn = document.getElementById('btn-invest');
        const feedback = document.getElementById('calc-feedback');

        if (val > 0) {
            btn.style.display = 'block'; // Reveal Button
            feedback.style.opacity = '1';

            const daily = val * (this.state.selectedRate / 100);
            const total = val + (daily * this.state.selectedDays);

            document.getElementById('preview-daily').innerText = daily.toFixed(2);
            document.getElementById('preview-total').innerText = total.toFixed(2);
        } else {
            btn.style.display = 'none';
            feedback.style.opacity = '0';
        }
    },

    attachListeners() {
        const input = document.getElementById('invest-amount');
        if(input) {
            input.addEventListener('input', () => this.updateCalculation());
        }
        
        // Expose functions to window for HTML onclick events
        window.selectPlan = (el, r, d, n) => this.selectPlan(el, r, d, n);
        window.executeTrade = () => this.executeTrade();
    },

    // --- 5. CHART RENDERER ---
    initChart() {
        const ctx = document.getElementById('tradeChart');
        if (!ctx) return;

        // Gradient
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25'],
                datasets: [{
                    label: 'Market Trend',
                    data: [12, 19, 15, 25, 22, 30],
                    borderColor: '#008b8b',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } }
            }
        });
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    TradeController.init();
});