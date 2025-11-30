/**
 * 🗄️ CASHFORGE DATABASE MODULE
 * Handles all CRUD operations with Supabase.
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

    // Profile creation is handled by Supabase Auth Trigger, but update is manual
    updateProfile: async (userId, updates) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error("DB: Update Profile Error", error);
            return { success: false, message: error.message };
        }
    },

    // --- 2. BALANCE & TRANSACTIONS ---
    updateBalance: async (userId, amount) => {
        // Fetch current balance first to ensure atomic-like update
        // In production, use a Postgres Function (RPC) for true atomicity
        try {
            const { data: profile } = await supabase.from('profiles').select('balance').eq('id', userId).single();
            const newBalance = (parseFloat(profile.balance) || 0) + parseFloat(amount);
            
            const { error } = await supabase
                .from('profiles')
                .update({ balance: newBalance })
                .eq('id', userId);
                
            if(error) throw error;
            return newBalance;
        } catch (error) {
            console.error("DB: Update Balance Error", error);
            return null;
        }
    },

    createTransaction: async (userId, type, amount, method = 'System', status = 'success', proofUrl = null) => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .insert([{
                    user_id: userId,
                    type: type, // 'deposit', 'withdraw', 'trade_profit', 'task_reward'
                    amount: amount,
                    method: method,
                    status: status,
                    proof_url: proofUrl
                }])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error("DB: Create Transaction Error", error);
            return { success: false, message: error.message };
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

    addWallet: async (userId, label, address, network = 'TRC20') => {
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

    // --- 4. PACKAGES ---
    getActivePackage: async (userId) => {
        try {
            const { data, error } = await supabase
                .from('user_packages')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            return null;
        }
    },

    purchasePackage: async (userId, packageId, cost, dailyRoi) => {
        try {
            // Deactivate old packages first (Single Package Rule)
            await supabase
                .from('user_packages')
                .update({ is_active: false })
                .eq('user_id', userId);

            // Add new package
            const { error } = await supabase
                .from('user_packages')
                .insert([{
                    user_id: userId,
                    package_id: packageId,
                    invested_amount: cost,
                    daily_roi: dailyRoi,
                    is_active: true
                }]);

            if(error) throw error;
            
            // Update Profile active_package_id for quick access
            await supabase.from('profiles').update({ active_package_id: packageId }).eq('id', userId);

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // --- 5. TRADES ---
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
            
            // Balance deduction should be handled by caller (logic.js) via updateBalance
            return { success: true, trade: data };
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
            
            // Transaction log creation should be handled by caller
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    // --- 6. TASKS ---
    getCompletedTasksToday: async (userId) => {
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
            return [];
        }
    },

    logTaskCompletion: async (userId, taskId, reward) => {
        try {
            const { error } = await supabase
                .from('task_logs')
                .insert([{ user_id: userId, task_id: taskId, reward_amount: reward }]);
            
            if(error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // --- 7. IMAGE UPLOAD ---
    uploadAvatar: async (userId, file) => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('profile-pictures')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('profile-pictures')
                .getPublicUrl(fileName);
                
            // Update profile
            await DB.updateProfile(userId, { avatar_url: data.publicUrl });

            return { success: true, url: data.publicUrl };
        } catch (error) {
            console.error("Upload Error", error);
            return { success: false, message: error.message };
        }
    }
};
