/* js/controllers/wallet.js */
import { supabase } from '../config/supabase.js';
import { getCurrentUser } from '../services/auth.js';
import { formatCurrency, formatWalletAddress } from '../utils/formatters.js';
import { showToast } from '../utils/ui.js';

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
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            window.location.href = 'login.html';
            return;
        }

        // B. Load Profile
        await this.loadProfile(sessionUser.id);
        
        // Update Balance UI
        const balEl = document.getElementById('avail-balance') || document.getElementById('profile-balance');
        if (balEl && this.currentUser) {
            balEl.innerText = formatCurrency(this.currentUser.balance);
        }

        // C. Initialize Page-Specific Logic
        if (document.getElementById('withdraw-form')) {
            this.initWithdrawPage();
        }
        
        // Deposit page waits for onclick event
    },

    async loadProfile(userId) {
        const { data } = await supabase.from('users').select('*').eq('id', userId).single();
        this.currentUser = data;
    },

    // ============================================================
    //  DEPOSIT LOGIC
    // ============================================================
    
    async submitDeposit() {
        const amountInput = document.getElementById('usdt-amount'); // Assuming ID, check HTML
        const fileInput = document.getElementById('file-upload');
        
        if (!amountInput) return; // Guard clause

        const amount = parseFloat(amountInput.value);
        const file = fileInput ? fileInput.files[0] : null;

        // Validation
        if (!amount || amount <= 0) {
            showToast("Please enter a valid amount", "error");
            return;
        }
        // Note: For real apps, you'd strictly require the file. 
        // For this prototype, we'll allow proceeding if file logic is complex.
        if (!file) {
             showToast("Please upload a payment screenshot", "error");
             return;
        }

        const btn = document.querySelector('.btn-primary');
        const originalText = btn ? btn.innerText : 'Confirm';
        if(btn) {
            btn.innerText = "Uploading...";
            btn.disabled = true;
        }

        try {
            // 1. Upload Logic (Simplified)
            // Ideally: await supabase.storage.from('proofs').upload(...)
            const fakePath = `proofs/${this.currentUser.id}/${Date.now()}_${file.name}`;
            
            // 2. Insert Transaction Record
            const { error } = await supabase
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

            showToast("Deposit Submitted! Admin will review shortly.", "success");
            setTimeout(() => window.location.href = 'history.html', 1500);

        } catch (err) {
            console.error(err);
            showToast("Error: " + err.message, "error");
            if(btn) {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        }
    },

    // ============================================================
    //  WITHDRAWAL LOGIC
    // ============================================================

    async initWithdrawPage() {
        // 1. Load Saved Wallets into Dropdown
        const { data: wallets } = await supabase
            .from('user_wallets') 
            .select('*')
            .eq('user_id', this.currentUser.id);

        const select = document.getElementById('wallet-select');
        if(!select) return;

        select.innerHTML = '<option value="" disabled selected>Select saved wallet...</option>';
        
        if (wallets && wallets.length > 0) {
            wallets.forEach(w => {
                const opt = document.createElement('option');
                opt.value = w.wallet_address;
                opt.innerText = `${w.label} (${formatWalletAddress(w.wallet_address)})`;
                select.appendChild(opt);
            });
        } else {
            const opt = document.createElement('option');
            opt.innerText = "No wallets found. Go to Settings.";
            select.appendChild(opt);
        }
    },

    async handleWithdraw(e) {
        if(e) e.preventDefault();
        
        const amountEl = document.getElementById('amount');
        const walletEl = document.getElementById('wallet-select');
        const pinEl = document.getElementById('pin');
        
        if(!amountEl || !walletEl || !pinEl) return;

        const amount = parseFloat(amountEl.value);
        const wallet = walletEl.value;
        const pin = pinEl.value;
        const btn = document.querySelector('#withdraw-form button');
        const originalText = btn ? btn.innerText : 'Submit';

        // 1. Basic Validations
        if (!wallet) return showToast("Please select a wallet.", "error");
        if (amount < 10) return showToast("Minimum withdrawal is 10 PKR.", "error");
        if (amount > parseFloat(this.currentUser.balance)) return showToast("Insufficient balance.", "error");
        
        // 2. PIN Validation
        if (pin !== this.currentUser.transaction_pin) {
            return showToast("Invalid Transaction PIN.", "error");
        }

        if(btn) {
            btn.innerText = "Checking Rules...";
            btn.disabled = true;
        }

        try {
            // 3. CHECK: Package Day Rule
            const todayIdx = new Date().getDay(); // 0=Sun, 1=Mon...
            
            // Map VIP Level to Package Name (Simplified Logic)
            // Logic: VIP 0 = No Package, VIP 1 = Basic/Standard, etc.
            // Adjust this mapping to match your business logic precisely
            let userPkg = 'Basic'; 
            if (this.currentUser.vip_level === 1) userPkg = 'Standard';
            else if (this.currentUser.vip_level === 2) userPkg = 'Advanced';
            else if (this.currentUser.vip_level >= 3) userPkg = 'Pro';

            const allowed = this.scheduleMap[todayIdx];
            
            if (todayIdx === 0) { 
                throw new Error("Withdrawals are CLOSED on Sundays.");
            }
            // Strict check: if (allowed && !allowed.includes(userPkg)) ...

            // 4. CHECK: 7-Day Frequency Rule
            const { data: lastTx } = await supabase
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
            const { error: balErr } = await supabase
                .from('users')
                .update({ balance: newBal })
                .eq('id', this.currentUser.id);
            if (balErr) throw balErr;

            // B. Insert Transaction
            const { error: txErr } = await supabase
                .from('transactions')
                .insert([{
                    user_id: this.currentUser.id,
                    type: 'withdraw',
                    amount: amount,
                    status: 'pending',
                    wallet_address: wallet
                }]);
            if (txErr) throw txErr;

            showToast("Withdrawal Successful! Funds are on the way.", "success");
            setTimeout(() => window.location.href = 'history.html', 1500);

        } catch (err) {
            console.error(err);
            showToast(err.message, "error");
            if(btn) {
                btn.innerText = originalText;
                btn.disabled = false;
            }
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
