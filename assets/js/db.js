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

    // --- 2. FILE UPLOADER (Generic) ---
    uploadFile: async (bucket, path, file) => {
        try {
            // Upload
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(path, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get URL
            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(path);
                
            return { success: true, url: data.publicUrl };
        } catch (error) {
            console.error("DB: Upload Error", error);
            return { success: false, message: error.message };
        }
    },

    // --- 3. TRANSACTIONS ---
    createTransaction: async (userId, type, amount, method, status, proofFile) => {
        try {
            let proofUrl = null;

            // 1. Upload Proof if provided
            if (proofFile) {
                const fileExt = proofFile.name.split('.').pop();
                const fileName = `${userId}-${Date.now()}.${fileExt}`;
                
                const upload = await DB.uploadFile('deposit-proofs', fileName, proofFile);
                if (!upload.success) throw new Error("Image upload failed: " + upload.message);
                
                proofUrl = upload.url;
            }

            // 2. Insert Database Record
            const { data, error } = await supabase
                .from('transactions')
                .insert([{
                    user_id: userId,
                    type: type, 
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
            console.error("DB: Transaction Error", error);
            return { success: false, message: error.message };
        }
    },

    // --- 4. WALLETS ---
    getWallets: async (userId) => {
        const { data } = await supabase.from('user_wallets').select('*').eq('user_id', userId);
        return data || [];
    },

    addWallet: async (userId, label, address, network = 'TRC20') => {
        const { error } = await supabase
            .from('user_wallets')
            .insert([{ user_id: userId, label, address, network }]);
        return { success: !error };
    }
};