/**
 * 🗄️ CASHFORGE DATABASE MODULE
 * Handles all CRUD operations with Supabase.
 * Modified to ensure Balance updates are propagated back to the UI.
 */

import { supabase } from './supabase-client.js';

export const DB = {
    
    // --- 1. USER PROFILE ---
    getProfile: async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error("DB: Get Profile Error", error);
            return null;
        }
    },

    createProfile: async (userId, email, fullName) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .insert([{ id: userId, email, full_name: fullName, referral_code: Math.random().toString(36).substring(2, 10) }]);
            
            if (error) console.log("Profile auto-creation skipped (likely trigger handled it).");
        } catch (error) {
            // Ignore duplicate key errors if trigger worked
        }
    },

    updateBalance: async (userId, amount) => {
        // WARNING: In production, use RPC (Remote Procedure Call) for atomic updates
        // to prevent race conditions. For now, we do read-modify-write.
        try {
            const { data: profile } = await supabase.from('profiles').select('balance').eq('id', userId).single();
            
            // Ensure we handle strings/numbers correctly
            const currentBal = parseFloat(profile.balance) || 0;
            const change = parseFloat(amount);
            const newBalance = currentBal + change;
            
            const { error } = await supabase
                .from('profiles')
                .update({ balance: newBalance })
                .eq('id', userId);
                
            if(error) throw error;
            
            return newBalance; // Returns the exact value in DB
        } catch (error) {
            console.error("DB: Update Balance Error", error);
            return null;
        }
    },

    // --- 2. TRANSACTIONS ---
    createTransaction: async (userId, type, amount, method, proofUrl = null) => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .insert([{
                    user_id: userId,
                    type: type, 
                    amount: amount,
                    method: method,
                    status: 'pending',
                    proof_url: proofUrl
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("DB: Create Transaction Error", error);
            return null;
        }
    },

    getTransactions: async (userId) => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("DB: Get History Error", error);
            return [];
        }
    },

    // --- 3. WALLETS ---
    getWallets: async (userId) => {
        try {
            const { data, error } = await supabase
                .from('user_wallets')
                .select('*')
                .eq('user_id', userId);
            
            if(error) throw error;
            return data;
        } catch (error) {
            console.error("DB: Get Wallets Error", error);
            return [];
        }
    },

    addWallet: async (userId, label, address, network) => {
        try {
            const { data, error } = await supabase
                .from('user_wallets')
                .insert([{ user_id: userId, label, address, network }])
                .select()
                .single();
            
            if(error) throw error;
            return { success: true, wallet: data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // --- 4. TRADES ---
    getActiveTrade: async (userId) => {
        try {
            const { data, error } = await supabase
                .from('trades')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'active')
                .single();
            
            if (error && error.code !== 'PGRST116') throw error; 
            return data; 
        } catch (error) {
            console.error("DB: Get Active Trade Error", error);
            return null;
        }
    },

    startTrade: async (userId, tierId, amount, durationMs) => {
        try {
            const startTime = Date.now();
            const endTime = startTime + durationMs;
            
            const { data, error } = await supabase
                .from('trades')
                .insert([{
                    user_id: userId,
                    tier_id: tierId,
                    amount: amount,
                    start_time: startTime,
                    end_time: endTime,
                    status: 'active'
                }])
                .select()
                .single();

            if(error) throw error;
            
            // [FIX] Capture the new balance and return it
            const newBalance = await DB.updateBalance(userId, -amount);
            
            return { success: true, trade: data, newBalance: newBalance };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    completeTrade: async (userId, tradeId, profitAmount) => {
        try {
            const { error } = await supabase
                .from('trades')
                .update({ status: 'completed' })
                .eq('id', tradeId);
            
            if(error) throw error;

            // [FIX] Capture the new balance
            const newBalance = await DB.updateBalance(userId, profitAmount);
            
            await DB.createTransaction(userId, 'trade_profit', profitAmount, 'System');

            return { success: true, newBalance: newBalance };
        } catch (error) {
            console.error("DB: Complete Trade Error", error);
            return { success: false };
        }
    },

    // --- 5. TASKS ---
    getDailyTasks: async (userId) => {
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        
        try {
            const { data, error } = await supabase
                .from('task_logs')
                .select('task_id')
                .eq('user_id', userId)
                .gte('completed_at', startOfDay.toISOString());
                
            if(error) throw error;
            return data.map(t => t.task_id); 
        } catch (error) {
            console.error("DB: Get Tasks Error", error);
            return [];
        }
    },

    completeTask: async (userId, taskId, reward) => {
        try {
            const { error } = await supabase
                .from('task_logs')
                .insert([{ user_id: userId, task_id: taskId, reward_amount: reward }]);
            
            if(error) throw error;

            // [FIX] Capture the new balance
            const newBalance = await DB.updateBalance(userId, reward);
            
            return { success: true, newBalance: newBalance };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // --- 6. FILE UPLOAD ---
    uploadProof: async (userId, file) => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('deposit-proofs')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('deposit-proofs')
                .getPublicUrl(filePath);
                
            return { success: true, url: data.publicUrl };
        } catch (error) {
            console.error("DB: Upload Error", error);
            return { success: false, message: error.message };
        }
    }
};
