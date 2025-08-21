
"use server";

import { getSupabaseAdmin } from "@/lib/supabase-client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const OrderSchema = z.object({
  customer_id: z.string().uuid(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number(),
    price: z.number(),
  })),
});

export async function addOrder(values: z.infer<typeof OrderSchema>) {
    const supabase = getSupabaseAdmin();

    // 1. Insert the order
    const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([{ 
            customer_id: values.customer_id, 
            status: 'pending',
        }])
        .select('id, customer_id')
        .single();
    
    if (orderError) {
        console.error("Order creation error:", JSON.stringify(orderError, null, 2));
        return { error: `فشل إنشاء الطلب: ${orderError.message}` };
    }

    if (!orderData) {
        return { error: "لم يتم إرجاع معرف الطلب بعد الإنشاء." };
    }

    // 2. Prepare final order items with the new order ID
    const finalOrderItems = values.items.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
    }));

    // Insert all order items
    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(finalOrderItems);

    if (itemsError) {
        console.error("Order items creation error:", JSON.stringify(itemsError, null, 2));
        // If items fail, roll back the order insertion
        await supabase.from('orders').delete().eq('id', orderData.id);
        return { error: `فشل إضافة عناصر الطلب: ${itemsError.message}` };
    }

    // 3. Decrease stock for each product
    for (const item of values.items) {
        const { error: stockError } = await supabase.rpc('decrease_stock', {
            p_product_id: item.product_id,
            p_quantity: item.quantity
        });

        if (stockError) {
            console.error(`Stock update error for product ${item.product_id}:`, JSON.stringify(stockError, null, 2));
            return { error: `فشل تحديث مخزون المنتج ${item.product_id}: ${stockError.message}` };
        }
    }

    revalidatePath("/orders");
    if (orderData.customer_id) {
      revalidatePath(`/customers/${orderData.customer_id}`);
    }
    return { data: orderData };
}
