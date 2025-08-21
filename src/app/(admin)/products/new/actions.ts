"use server";

import { getSupabaseAdmin } from "@/lib/supabase-client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ProductSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  price: z.number(),
  stock: z.number(),
});

export async function addProduct(values: z.infer<typeof ProductSchema>) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from("products")
        .insert([{ 
            name: values.name,
            description: values.description,
            image_url: values.image_url || null,
            price: values.price,
            stock: values.stock,
        }])
        .select();

    if (error) {
        if (error.code === '23505') { // Unique constraint violation on SKU
             return { error: "رمز المنتج (SKU) هذا موجود بالفعل." };
        }
        return { error: error.message };
    }

    revalidatePath("/products");
    revalidatePath("/orders/new");
    return { data };
}
