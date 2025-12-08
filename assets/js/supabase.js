/**
 * Supabase Client Initialization
 * Dependencies: config.js
 */

// Replace these placeholders with the user's provided credentials
const SUPABASE_URL = "https://wzndkodpvadnuwlaocqt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6bmRrb2RwdmFkbnV3bGFvY3F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTEyMTEsImV4cCI6MjA4MDc4NzIxMX0.uU9YWewmMZrgBZT0Z-XD-jKcz3maembnZXpN7yH_nD0";

// Initialize Supabase Client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("Supabase Client Initialized.");

// --- Global Supabase Tables (Adjust these if your table names are different) ---
const TABLE_USERS = 'users';
const TABLE_PLANS = 'plans';
const TABLE_TRANSACTIONS = 'transactions';
const TABLE_INVESTMENTS = 'active_investments';
const TABLE_TASKS = 'daily_tasks'; 
const TABLE_TEAM = 'team';