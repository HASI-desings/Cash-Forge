/**
 * Supabase Client Initialization
 * Initializes the Supabase client and defines global table constants.
 */

// Your Supabase Project URL and Public Key (ANON Key)
const SUPABASE_URL = "https://wzndkodpvadnuwlaocqt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6bmRrb2RwdmFkbnV3bGFvY3F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTEyMTEsImV4cCI6MjA4MDc4NzIxMX0.uU9YWewmMZrgBZT0Z-XD0-jKcz3maembnZXpN7yH_nD0";

// Initialize Supabase Client globally
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("Supabase Client Initialized and Connected.");

// --- Global Supabase Tables (Must match your SQL schema) ---
const TABLE_USERS = 'users';
const TABLE_PLANS = 'plans';
const TABLE_TRANSACTIONS = 'transactions';
const TABLE_INVESTMENTS = 'active_investments';
const TABLE_TASKS = 'daily_tasks'; 
const TABLE_TEAM = 'team'; 
const TABLE_VIP_SALARY = 'vip_salary_claims'; // Used for claiming/logging monthly salary
