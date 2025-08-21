import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Note: supabaseAdmin is for server-side use ONLY.
let supabaseAdmin: ReturnType<typeof createClient> | null = null;
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

const getSupabaseAdmin = () => {
    if (!supabaseAdmin) {
        throw new Error("Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.");
    }
    return supabaseAdmin;
}


export { getSupabaseAdmin };
