"use server";

import { getSupabaseAdmin } from "@/lib/supabase-client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdateStatusSchema = z.object({
    id: z.string().uuid(),
    status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"])
});

export async function updateOrderStatus(values: z.infer<typeof UpdateStatusSchema>) {
    const supabase = getSupabaseAdmin();

    const updatePayload: { status: string } = { status: values.status };

    const { data, error } = await supabase
        .from("orders")
        .update(updatePayload)
        .eq("id", values.id)
        .select('id, customer_id')
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/admin/dashboard`);
    revalidatePath(`/admin/orders`);
    revalidatePath(`/admin/orders/${values.id}`);
    if (data?.customer_id) {
        revalidatePath(`/admin/customers/${data.customer_id}`);
    }
    
    return { data: { success: true } };
}

export async function deleteOrder(id: string) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
        return { error: error.message };
    }
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    return { data: { success: true }};
}
