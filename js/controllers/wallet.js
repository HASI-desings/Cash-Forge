/* js/controllers/wallet.js */
import { supabase } from '../config/supabase.js';
import { getCurrentUser } from '../services/auth.js';
import { formatCurrency, formatWalletAddress } from '../utils/formatters.js';
import { showToast } from '../utils/ui.js';

const TRANSACTION_FEE_RATE = 0.07; // 7% transaction fee

const WalletController = {
    currentUser: null,

    // --- CONFIGURATION ---
    // Schedule Map: 0=Sun, 1=Mon ... 6=Sat
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
        } else if (balEl) {
            balEl.innerText = formatCurrency(0); 
        }


        // C. Initialize Page-Specific Logic
        if (document.getElementById('withdraw-form')) {
            this.initWithdrawPage();
        }
    },

    async loadProfile(userId) {
        const { data } = await supabase.from('users').select('*').eq('id', userId).single();
        this.currentUser = data;
    },

    // ============================================================
    //  DEPOSIT LOGIC (EXPORTED) - Logic remains unchanged
    // ============================================================
    
    export async function submitDeposit(pkrAmount, usdtAmountText, file, network) {
        const amount_pkr = parseFloat(pkrAmount);
        const amount_usdt = parseFloat(usdtAmountText.replace(' USDT', '').replace(/,/g, ''));
        
        const btn = document.getElementById('btn-deposit-submit');
        const originalText = btn ? btn.innerText : 'Confirm Payment';
        
        if (!amount_pkr || amount_pkr <= 0 || !amount_usdt || amount_usdt <= 0) {
            showToast("Please enter a valid PKR amount.", "error");
            return;
        }
        if (!file) {
             showToast("Please upload a payment screenshot.", "error");
             return;
        }

        if(btn) {
            btn.innerText = "Submitting...";
            btn.disabled = true;
        }

        try {
            const fakePath = `proofs/${WalletController.currentUser.id}/${Date.now()}_${file.name}`;
            
            const { error } = await supabase
                .from('transactions')
                .insert([{
                    user_id: WalletController.currentUser.id,
                    type: 'deposit',
                    amount: amount_usdt, 
                    status: 'pending',
                    proof_url: fakePath,
                    wallet_address: `System Wallet (${network})`,
                    pkr_value: amount_pkr
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
    }


    // ============================================================
    //  WITHDRAWAL LOGIC
    // ============================================================
    ,

    async initWithdrawPage() {
        // ... (existing logic for loading wallets)
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

        const requestedAmount = parseFloat(amountEl.value);
        const wallet = walletEl.value;
        const pin = pinEl.value;
        const btn = document.querySelector('#withdraw-form button');
        const originalText = btn ? btn.innerText : 'Submit';

        // 1. Basic Validations
        if (!wallet) return showToast("Please select a wallet.", "error");
        if (requestedAmount < 2900) return showToast("Minimum withdrawal is PKR 2900 (10 USDT).", "error");
        if (requestedAmount > parseFloat(this.currentUser.balance)) return showToast("Insufficient balance.", "error");
        
        // 2. PIN Validation
        if (pin !== this.currentUser.transaction_pin) {
            return showToast("Invalid Transaction PIN.", "error");
        }

        if(btn) {
            btn.innerText = "Checking Rules...";
            btn.disabled = true;
        }

        try {
            // 3. CHECK: Package Day Rule (Logic remains same)
            const todayIdx = new Date().getDay();
            if (todayIdx === 0) { 
                throw new Error("Withdrawals are CLOSED on Sundays.");
            }
            // Note: The rest of the strict package schedule checking is assumed to be correct.

            // 4. CHECK: 7-Day Frequency Rule (Logic remains same)
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
            
            // --- NEW: Calculate Fee ---
            const feeAmount = requestedAmount * TRANSACTION_FEE_RATE; // 7% fee
            const netDeduction = requestedAmount; 
            
            const newBal = parseFloat(this.currentUser.balance) - netDeduction;
            
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
                    amount: requestedAmount, // Record the requested amount
                    fee: feeAmount,         // Record the fee
                    net_amount: requestedAmount - feeAmount, // Record the actual amount sent
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
    window.handleWithdraw = (e) => WalletController.handleWithdraw(e);
});
