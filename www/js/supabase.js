const SUPABASE_URL = "https://tfshpcjfcibynsbdxztn.supabase.co";
const SUPABASE_KEY = "sb_publishable_97SyMugx0LKqTgE7RjI8lw_UPHD7Wfl";

window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);