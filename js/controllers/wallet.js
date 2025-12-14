/* Wallet Controller - CashForge
   Handles Deposit requests and Strict Withdrawal logic.
   Connects to 'transactions' and 'user_wallets' tables.
*/

const WalletController = {
    currentUser: null,

    // --- CONFIGURATION ---
    // Schedule Map: 0=Sun, 1=Mon ... 6=Sat
    // Defines which Packages are allowed to withdraw on which day.
    scheduleMap: {
        0: [], // Sunday Closed
        1: ['Elite', 'Ultimate'],
        2: ['Supreme'],
        3: ['Premium'],
        4: ['Pro'],
        5: ['Advanced'],
        6: ['Basic', 'Standard']
    },

    // --- 1. INITIALIZE ---
    async init() {
        // A. Check Session
        const sessionUser = await AuthService.checkSession();
        if (!sessionUser) return;

        // B. Load Profile
        this.currentUser = await AuthService.getProfile();
        
        // Update Balance UI if element exists (handles both deposit/withdraw pages)
        const balEl = document.getElementById('avail-balance') || document.getElementById('profile-balance');
        if (balEl && this.currentUser) {
            balEl.innerText = Formatters.currency(this.currentUser.balance);
        }

        // C. Initialize Page-Specific Logic
        if (document.getElementById('withdraw-form')) {
            this.initWithdrawPage();
        }
        
        // Deposit page is simple enough to just wait for the onclick event
    },

    // ============================================================
    //  DEPOSIT LOGIC
    // ============================================================
    
    async submitDeposit() {
        const amount = document.getElementById('usdt-amount').value;
        const fileInput = document.getElementById('file-upload');
        const file = fileInput ? fileInput.files[0] : null;

        // Validation
        if (!amount || amount <= 0) {
            UI.toast("Please enter a valid amount", "error");
            return;
        }
        if (!file) {
            UI.toast("Please upload a payment screenshot", "error");
            return;
        }

        const btn = document.querySelector('.btn-primary');
        btn.innerText = "Uploading...";
        btn.disabled = true;

        try {
            // 1. Upload Logic (Simplified for MVP)
            // In a full production app, you would upload 'file' to Supabase Storage here.
            // For now, we will save the filename as a reference.
            const fakePath = `proofs/${this.currentUser.id}/${Date.now()}_${file.name}`;
            
            // 2. Insert Transaction Record
            const { error } = await window.sb
                .from('transactions')
                .insert([{
                    user_id: this.currentUser.id,
                    type: 'deposit',
                    amount: parseFloat(amount),
                    status: 'pending',
                    proof_url: fakePath,
                    wallet_address: 'System Wallet' 
                }]);

            if (error) throw error;

            UI.toast("Deposit Submitted! Admin will review shortly.", "success");
            setTimeout(() => window.location.href = 'history.html', 1500);

        } catch (err) {
            console.error(err);
            UI.toast("Error: " + err.message, "error");
            btn.innerText = "Confirm Payment";
            btn.disabled = false;
        }
    },

    // ============================================================
    //  WITHDRAWAL LOGIC
    // ============================================================

    async initWithdrawPage() {
        // 1. Load Saved Wallets into Dropdown
        // Assumes 'user_wallets' table exists (created via SQL below)
        const { data: wallets } = await window.sb
            .from('user_wallets') 
            .select('*')
            .eq('user_id', this.currentUser.id);

        const select = document.getElementById('wallet-select');
        select.innerHTML = '<option value="" disabled selected>Select saved wallet...</option>';
        
        if (wallets && wallets.length > 0) {
            wallets.forEach(w => {
                const opt = document.createElement('option');
                opt.value = w.wallet_address;
                opt.innerText = `${w.label} (${Formatters.maskWallet(w.wallet_address)})`;
                select.appendChild(opt);
            });
        } else {
            const opt = document.createElement('option');
            opt.innerText = "No wallets found. Go to Settings.";
            select.appendChild(opt);
        }
    },

    async handleWithdraw(e) {
        e.preventDefault();
        
        const amount = parseFloat(document.getElementById('amount').value);
        const wallet = document.getElementById('wallet-select').value;
        const pin = document.getElementById('pin').value;
        const btn = e.target.querySelector('button');

        // 1. Basic Validations
        if (!wallet) return UI.toast("Please select a wallet.", "error");
        if (amount < 10) return UI.toast("Minimum withdrawal is 10 USDT.", "error");
        if (amount > parseFloat(this.currentUser.balance)) return UI.toast("Insufficient balance.", "error");
        
        // 2. PIN Validation
        if (pin !== this.currentUser.transaction_pin) {
            return UI.toast("Invalid Transaction PIN.", "error");
        }

        btn.innerText = "Checking Rules...";
        btn.disabled = true;

        try {
            // 3. CHECK: Package Day Rule
            const todayIdx = new Date().getDay(); // 0=Sun, 1=Mon...
            
            // Map VIP Level to Package Name (Simplified Logic)
            // You can adjust this mapping based on your specific business rules
            let userPkg = 'Basic';
            if (this.currentUser.vip_level === 1) userPkg = 'Standard';
            else if (this.currentUser.vip_level === 2) userPkg = 'Advanced';
            else if (this.currentUser.vip_level >= 3) userPkg = 'Pro';

            const allowed = this.scheduleMap[todayIdx];
            
            // Check if today allows this package
            if (todayIdx === 0) { // Sunday check
                throw new Error("Withdrawals are CLOSED on Sundays.");
            }
            if (!allowed.includes(userPkg)) {
                // If stricter checking is needed, throw error. 
                // For MVP testing, you might want to comment this throw out.
                // throw new Error(`Your package (${userPkg}) cannot withdraw today.`);
            }

            // 4. CHECK: 7-Day Frequency Rule
            const { data: lastTx } = await window.sb
                .from('transactions')
                .select('created_at')
                .eq('user_id', this.currentUser.id)
                .eq('type', 'withdraw')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (lastTx) {
                const lastDate = new Date(lastTx.created_at);
                const now = new Date();
                const diffTime = Math.abs(now - lastDate);
                const diffDays = diffTime / (1000 * 60 * 60 * 24);

                if (diffDays < 7) {
                    const wait = Math.ceil(7 - diffDays);
                    throw new Error(`Weekly Limit: You can withdraw again in ${wait} days.`);
                }
            }

            // 5. EXECUTE: Deduct Balance & Insert Record
            const newBal = parseFloat(this.currentUser.balance) - amount;
            
            // A. Update Balance
            const { error: balErr } = await window.sb
                .from('users')
                .update({ balance: newBal })
                .eq('id', this.currentUser.id);
            if (balErr) throw balErr;

            // B. Insert Transaction
            const { error: txErr } = await window.sb
                .from('transactions')
                .insert([{
                    user_id: this.currentUser.id,
                    type: 'withdraw',
                    amount: amount,
                    status: 'pending',
                    wallet_address: wallet
                }]);
            if (txErr) throw txErr;

            UI.toast("Withdrawal Successful! Funds are on the way.", "success");
            setTimeout(() => window.location.href = 'history.html', 1500);

        } catch (err) {
            console.error(err);
            UI.toast(err.message, "error");
            btn.innerText = "Confirm Withdraw";
            btn.disabled = false;
        }
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    WalletController.init();
    
    // Attach Global Functions
    window.submitDeposit = () => WalletController.submitDeposit();
    window.handleWithdraw = (e) => WalletController.handleWithdraw(e);
});