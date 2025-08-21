
"use server";

import { getSupabaseAdmin } from "@/lib/supabase-client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ReturnSchema = z.object({
  order_id: z.string().uuid("يجب اختيار طلب صالح"),
  items: z.array(z.object({
    order_item_id: z.string().uuid(),
    product_id: z.string().uuid(),
    quantity: z.coerce.number().min(1, "الكمية المرتجعة يجب أن تكون 1 على الأقل"),
  })).min(1, "يجب إرجاع منتج واحد على الأقل"),
  reason: z.string().optional(),
});

export async function addReturn(values: z.infer<typeof ReturnSchema>) {
    const supabase = getSupabaseAdmin();

    // 1. Create the return record
    const { data: returnData, error: returnError } = await supabase
        .from("returns")
        .insert([{ 
            order_id: values.order_id, 
            reason: values.reason,
        }])
        .select('id')
        .single();
    
    if (returnError) {
        console.error("Return creation error:", returnError);
        return { error: `فشل إنشاء المرتجع: ${returnError.message}` };
    }

    // 2. Prepare and insert return items
    const returnItems = values.items.map(item => ({
        return_id: returnData.id,
        order_item_id: item.order_item_id,
        product_id: item.product_id,
        quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
        .from('return_items')
        .insert(returnItems);

    if (itemsError) {
        console.error("Return items creation error:", itemsError);
        await supabase.from('returns').delete().eq('id', returnData.id); // Rollback
        return { error: `فشل إضافة عناصر المرتجع: ${itemsError.message}` };
    }

    // 3. Increase stock for each returned product
    for (const item of values.items) {
        const { error: stockError } = await supabase.rpc('adjust_stock', {
            p_product_id: item.product_id,
            p_quantity_delta: item.quantity // Positive value to increase stock
        });
        if (stockError) {
           console.error(`Stock adjustment error for product ${item.product_id}:`, stockError);
           // Potentially rollback return creation as well if stock update is critical
           return { error: `فشل تحديث مخزون المنتج ${item.product_id}: ${stockError.message}` };
        }
    }
    
    revalidatePath("/returns");
    revalidatePath("/orders");
    revalidatePath(`/orders/${values.order_id}`);
    revalidatePath('/products');
    revalidatePath('/dashboard');
    return { data: returnData };
}


export async function getOrderItems(orderId: string) {
    if (!orderId) {
        return { data: [], error: null };
    }
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from('order_items')
        .select('*, products(name)')
        .eq('order_id', orderId);

    if (error) {
        return { data: [], error: error.message };
    }

    return { data, error: null };
}
