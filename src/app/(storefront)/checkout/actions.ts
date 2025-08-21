
"use server";

import { getSupabaseAdmin } from "@/lib/supabase-client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CustomerSchema = z.object({
  name: z.string(),
  phone: z.string(),
  address: z.string(),
});

const OrderItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().min(1),
  price: z.number().min(0),
});

const CreateOrderSchema = z.object({
  customer: CustomerSchema,
  items: z.array(OrderItemSchema).min(1),
});

export async function createOrder(values: z.infer<typeof CreateOrderSchema>) {
    const supabase = getSupabaseAdmin();
    const { customer, items } = values;

    try {
        // 1. Find or create customer
        let { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('phone', customer.phone)
            .single();

        let customerId: string;
        if (existingCustomer) {
            customerId = existingCustomer.id;
        } else {
            const { data: newCustomer, error: customerError } = await supabase
                .from('customers')
                .insert({ name: customer.name, phone: customer.phone, address: customer.address })
                .select('id')
                .single();
            if (customerError || !newCustomer) throw new Error(customerError?.message || "Failed to create customer");
            customerId = newCustomer.id;
        }

        // 2. Create the order
        const { data: orderData, error: orderError } = await supabase
            .from("orders")
            .insert({
                customer_id: customerId,
                status: 'pending',
                // Assuming total amount will be calculated by a trigger or should be calculated here
            })
            .select('id, order_number')
            .single();
        
        if (orderError || !orderData) throw new Error(orderError?.message || "Failed to create order");

        // 3. Insert order items
        const orderItems = items.map(item => ({
            order_id: orderData.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) throw new Error(itemsError.message);

        // 4. Update stock
        for (const item of items) {
            const { error: stockError } = await supabase.rpc('decrease_stock', {
                p_product_id: item.product_id,
                p_quantity: item.quantity
            });
            if (stockError) throw new Error(`Stock update failed for product ${item.product_id}: ${stockError.message}`);
        }
        
        // Revalidate paths
        revalidatePath('/');
        revalidatePath('/orders');
        revalidatePath(`/customers/${customerId}`);
        revalidatePath('/dashboard');

        return { data: orderData };

    } catch (error: any) {
        console.error("Create Order Error:", error);
        return { error: error.message };
    }
}
