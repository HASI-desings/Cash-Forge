/**
 * ⚡ SUPABASE CLIENT INITIALIZATION
 * Connects the frontend to the backend database.
 */

// Import Supabase from CDN (Ensure this script is loaded in HTML first)
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SUPABASE_URL = 'https://zdpkmxexqeirqnuproge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkcGtteGV4cWVpcnFudXByb2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMjQ5NjIsImV4cCI6MjA3OTgwMDk2Mn0.IOiW6omOrYf6tvPb30vhQSUPR_KRakhxa-pqhG8UYuc';

// Initialize Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other modules
export { supabase };