import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Doctor } from "../types/doctor.ts";

export const getSupabaseClient = (): SupabaseClient<any, "public", any> => {
    const supabaseUrl = 'https://rtprdqyabfsiyvbpidgp.supabase.co'
    const supabaseKey = import.meta.env.VITE_SUPABASE_KEY
    const supabase = createClient(supabaseUrl, supabaseKey)
    return supabase
}