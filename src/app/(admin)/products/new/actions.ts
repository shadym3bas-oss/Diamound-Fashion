
"use server";

import { getSupabaseAdmin } from "@/lib/supabase-client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ProductSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  image_urls: z.array(z.object({ value: z.string().url() })),
  colors: z.array(z.string()).optional(),
  price: z.number(),
  stock: z.number(),
});

export async function addProduct(values: z.infer<typeof ProductSchema>) {
    const supabase = getSupabaseAdmin();

    const image_urls = values.image_urls.map(img => img.value);

    const { data, error } = await supabase
        .from("products")
        .insert([{ 
            name: values.name,
            description: values.description,
            image_urls: image_urls,
            colors: values.colors,
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
