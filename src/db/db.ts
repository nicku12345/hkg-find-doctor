import { createClient } from '@supabase/supabase-js';
import { Doctor } from "../types/doctor.ts";

export async function connectAndQuery(): Promise<Doctor[]> {

    const supabaseUrl = 'https://rtprdqyabfsiyvbpidgp.supabase.co'
    const supabaseKey = import.meta.env.VITE_SUPABASE_KEY
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
        .from("DoctorInfo")
        .select("*")

    return data as Doctor[]
}