/**
 * CashForge Database Abstraction Layer (Supabase Final)
 * Handles all asynchronous CRUD operations via Supabase PostgREST API.
 * Dependencies: config.js, supabase.js, auth.js
 */

const DB = {
    
    // --- Data Caching (For performance, avoids repetitive DB calls) ---
    _cache: { user: null, plans: null },

    // =================================
    // 1. AUTH & USER MANAGEMENT
    // =================================

    /** Gets the currently authenticated user's ID. */
    getAuthId: async function() {
        const { data } = await supabase.auth.getUser();
        return data.user ? data.user.id : null;
    },
    
    /** Fetches the full user profile data from the 'users' table. */
    getUser: async function() {
        const userId = await this.getAuthId();
        if (!userId) return null;

        // Try to retrieve from cache first
        if (this._cache.user && this._cache.user.id === userId) return this._cache.user;

        const { data, error } = await supabase
            .from(TABLE_USERS)
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !data) {
            console.error("DB: Error fetching user profile:", error ? error.message : "No data.");
            return null;
        }

        this._cache.user = data;
        return data;
    },

    /** Updates a single field for the current user profile. */
    updateUserField: async function(field, value) {
        const userId = await this.getAuthId();
        if (!userId) return { success: false, msg: "Not authenticated." };

        const { error } = await supabase
            .from(TABLE_USERS)
            .update({ [field]: value })
            .eq('id', userId);

        this._cache.user = null; // Invalidate cache
        return { success: !error, msg: error ? error.message : "Updated successfully." };
    },

    /** Adds or deducts balance and logs the change. */
    updateBalance: async function(amount, type, details = {}) {
        const user = await this.getUser();
        if (!user) return { success: false, msg: "User not found." };
        
        const newBalance = parseFloat((user.balance + amount).toFixed(2));
        
        // 1. Update user balance
        const { error: balanceError } = await supabase
            .from(TABLE_USERS)
            .update({ balance: newBalance })
            .eq('id', user.id);

        if (balanceError) {
             return { success: false, msg: `Balance update failed: ${balanceError.message}` };
        }

        // 2. Log transaction
        await this.addTransaction({
            user_id: user.id,
            amount: amount,
            type: type, // 'deposit', 'withdraw', 'profit', 'investment', 'commission'
            status: 'success',
            details: details
        });

        this._cache.user = null; // Invalidate user cache
        return { success: true, newBalance: newBalance };
    },
    
    // =================================
    // 2. FINANCIAL & INVESTMENT DATA
    // =================================
    
    /** Fetches the static list of plans from the database. */
    getPlansData: async function() {
        if (this._cache.plans) return this._cache.plans;

        const { data, error } = await supabase
            .from(TABLE_PLANS)
            .select('*')
            .order('price', { ascending: true });
        
        if (error) console.error("DB: Error fetching plans:", error.message);
        
        this._cache.plans = data;
        return data || [];
    },
    
    /** Fetches the current user's active investments. */
    getMyActiveInvestments: async function() {
        const userId = await this.getAuthId();
        if (!userId) return [];
        
        const { data } = await supabase
            .from(TABLE_INVESTMENTS)
            .select('*, plan_id(name, duration_days)') // Join to get plan details
            .eq('user_id', userId)
            .eq('active', true);
            
        return data || [];
    },
    
    /** Logs a generic transaction record. */
    addTransaction: async function(data) {
        const { error } = await supabase.from(TABLE_TRANSACTIONS).insert(data);
        if (error) console.error("DB: Transaction logging failed:", error.message);
        return { success: !error };
    },
    
    /** Fetches transaction history for the current user. */
    getTransactions: async function(type = null) {
        const userId = await this.getAuthId();
        if (!userId) return [];
        
        let query = supabase
            .from(TABLE_TRANSACTIONS)
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (type) {
            query = query.eq('type', type);
        }

        const { data } = await query;
        return data || [];
    },

    // =================================
    // 3. TASK LOGIC
    // =================================
    
    /** Fetches today's task status. */
    getTaskProgress: async function() {
        const userId = await this.getAuthId();
        if (!userId) return { tasks_completed: 0, claimed: true };
        
        const today = new Date().toISOString().split('T')[0];
        
        let { data, error } = await supabase
            .from(TABLE_TASKS)
            .select('tasks_completed, claimed')
            .eq('user_id', userId)
            .eq('date', today)
            .single();
            
        // If no row found, return default uncompleted state
        if (error && error.code === 'PGRST116') { 
             data = { tasks_completed: 0, claimed: false };
        }
        
        return data || { tasks_completed: 0, claimed: false };
    },
    
    /** Updates the number of tasks completed for today. */
    completeTask: async function(newCount) {
        const userId = await this.getAuthId();
        const today = new Date().toISOString().split('T')[0];

        // Upsert (Insert or Update) the row
        const { error } = await supabase
            .from(TABLE_TASKS)
            .upsert({ user_id: userId, date: today, tasks_completed: newCount, claimed: false }, 
                    { onConflict: 'user_id, date' });
                    
        return { success: !error, error: error };
    },

    // =================================
    // 4. TEAM LOGIC (Requires Supabase Functions/Views)
    // =================================
    
    /** Mocks team stats retrieval (Actual logic requires Supabase function/view) */
    getTeamStats: async function() {
        const userId = await this.getAuthId();
        if (!userId) return { l1Members: 0, l2Members: 0, l3Members: 0, totalCommission: 0 };
        
        // NOTE: In a real app, you would call a Supabase RPC here: 
        // const { data } = await supabase.rpc('get_team_stats', { user_id: userId });
        
        // Mocked response for frontend stability:
        return { 
            l1Members: 12, 
            l2Members: 45, 
            l3Members: 128, 
            totalCommission: 45200 
        };
    },
    
    /** Fetches mock tier member lists (Requires Supabase function/view) */
    getTierMembers: async function(level) {
        // NOTE: In a real app, this calls Supabase Function to retrieve team members by level.
        // Mocked response for frontend stability:
        const data = [
            { user_name: 'MemberA' + level, commission_earned: 1500 * level, active: true, joined_at: '2023-10-25' },
            { user_name: 'MemberB' + level, commission_earned: 500 * level, active: true, joined_at: '2023-10-24' },
            { user_name: 'MemberC' + level, commission_earned: 0, active: false, joined_at: '2023-10-22' },
        ];
        return data;
    },

    /** Claims VIP Salary (Requires update to both user table and log in vip_salary_claims) */
    claimVIPSalaary: async function(level, amount) {
        const userId = await this.getAuthId();
        if (!userId) return { success: false, msg: "Not authenticated." };

        // 1. Update user VIP level and add balance
        const balanceResult = await this.updateBalance(amount, 'vip_salary');
        
        if (!balanceResult.success) return { success: false, msg: "Failed to update balance." };

        // 2. Mark VIP level on user profile
        await this.updateUserField('vip_level', level);

        // 3. Log the claim
        await supabase.from(TABLE_VIP_SALARY).insert({
            user_id: userId,
            level: level,
            amount: amount,
            date_claimed: new Date().toISOString().split('T')[0]
        });

        return { success: true };
    }
};

Object.freeze(DB);
