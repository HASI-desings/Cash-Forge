/* js/config/supabase.js */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// --- PRODUCTION KEYS ---
// These are the actual keys from your context, used for initialization.
const supabaseUrl = 'https://rredrilsugmxxkjiwndd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZWRyaWxzdWdteHhraml3bmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MDE0MzksImV4cCI6MjA4MTI3NzQzOX0.0yT_a8L9Unjvy4PEFCdZX9U3pgGJokXBTZakBd1qw8k';

// Initialize the Supabase client and EXPORT it as 'supabase'
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log initialization status for debugging
console.log("Supabase client initialized successfully with production keys.");
