"use server";

import { getSupabaseAdmin } from "@/lib/supabase-client";
import { revalidatePath } from "next/cache";

export async function deleteCustomer(id: string) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) {
        // This will fail if the customer has associated orders due to foreign key constraints
        console.error("Delete customer error:", error);
        return { error: error.message };
    }
    revalidatePath("/admin/customers");
    return { data: { success: true } };
}
