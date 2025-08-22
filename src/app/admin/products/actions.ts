"use server";

import { getSupabaseAdmin } from "@/lib/supabase-client";
import { revalidatePath } from "next/cache";

export async function deleteProduct(id: string) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
        // This will fail if the product is in any order_items
        console.error("Delete product error:", error);
        return { error: error.message };
    }
    revalidatePath("/admin/products");
    revalidatePath("/admin/orders/new");
    return { data: { success: true } };
}
