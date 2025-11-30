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

    // Update generic profile fields
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

    // --- 2. IMAGE UPLOAD (AVATAR) ---
    uploadAvatar: async (userId, file) => {
        try {
            // 1. Create unique file path: userId/timestamp.ext
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            // 2. Upload to Storage Bucket 'profile-pictures'
            // UPSERT = true means overwrite if exists (saves space)
            const { error: uploadError } = await supabase.storage
                .from('profile-pictures')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // 3. Get Public URL
            const { data } = supabase.storage
                .from('profile-pictures')
                .getPublicUrl(filePath);
                
            const publicUrl = data.publicUrl;

            // 4. Update Profile Table with new URL so it persists
            const { error: dbError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', userId);

            if (dbError) throw dbError;

            return { success: true, url: publicUrl };

        } catch (error) {
            console.error("Upload Avatar Error:", error);
            return { success: false, message: error.message };
        }
    },

    // --- 3. BALANCE & TRANSACTIONS ---
    createTransaction: async (userId, type, amount, method = 'System', status = 'success', proofFile = null) => {
        try {
            let proofUrl = null;

            // If there is a proof file, upload it first
            if (proofFile) {
                const fileExt = proofFile.name.split('.').pop();
                const fileName = `${userId}-${Date.now()}.${fileExt}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('deposit-proofs')
                    .upload(fileName, proofFile);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('deposit-proofs')
                    .getPublicUrl(fileName);
                    
                proofUrl = data.publicUrl;
            }

            // Create the Transaction Record
            const { data, error } = await supabase
                .from('transactions')
                .insert([{
                    user_id: userId,
                    type: type, 
                    amount: amount,
                    method: method,
                    status: status,
                    proof_url: proofUrl // Save the URL we just generated
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

    // ... (Keep getTransactions, getWallets, addWallet, etc. from previous versions) ...
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
            return [];
        }
    },

    getWallets: async (userId) => {
        const { data } = await supabase.from('user_wallets').select('*').eq('user_id', userId);
        return data || [];
    },
    
    addWallet: async (userId, label, address) => {
        const { error } = await supabase.from('user_wallets').insert([{ user_id: userId, label, address }]);
        return { success: !error };
    }
};
