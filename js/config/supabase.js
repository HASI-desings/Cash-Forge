/* CashForge - Supabase Configuration
   
   CRITICAL STEP: 
   You MUST include the Supabase SDK in every HTML file's <head> section 
   for this to work. Paste this line into your HTML files:
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
*/

const SUPABASE_URL = 'https://rredrilsugmxxkjiwndd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZWRyaWxzdWdteHhraml3bmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MDE0MzksImV4cCI6MjA4MTI3NzQzOX0.0yT_a8L9Unjvy4PEFCdZX9U3pgGJokXBTZakBdWqw8k';

// Check if the library is loaded
if (typeof supabase === 'undefined') {
    console.error('CRITICAL ERROR: Supabase SDK is not loaded. Please add the CDN script tag to your HTML head.');
} else {
    // Initialize the Supabase Client
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Make it available globally as 'sb' (shorthand)
    window.sb = supabaseClient;
    
    console.log("Supabase initialized successfully.");
}