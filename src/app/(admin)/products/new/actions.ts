
"use server";

import { getSupabaseAdmin } from "@/lib/supabase-client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ProductSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  image_urls: z.array(z.object({ value: z.string().min(1) })),
  colors: z.array(z.string()).optional(),
  price: z.number(),
  stock: z.number(),
});

// Function to upload a base64 image to Supabase Storage
async function uploadBase64Image(base64: string): Promise<string> {
    const supabase = getSupabaseAdmin();
    const matches = base64.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error("Invalid base64 string");
    }

    const mime = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

    const { data, error } = await supabase.storage
        .from('images') // Ensure you have a bucket named 'images'
        .upload(fileName, buffer, {
            contentType: mime,
            upsert: true,
        });

    if (error) {
        throw error;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
    return publicUrl;
}

export async function addProduct(values: z.infer<typeof ProductSchema>) {
    const supabase = getSupabaseAdmin();

    const imageUrls = await Promise.all(
        values.image_urls.map(async (img) => {
            if (img.value.startsWith('data:image')) {
                return uploadBase64Image(img.value);
            }
            return img.value; // It's already a URL
        })
    );

    const { data, error } = await supabase
        .from("products")
        .insert([{ 
            name: values.name,
            description: values.description,
            image_urls: imageUrls,
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

    revalidatePath("/admin/products");
    revalidatePath("/admin/orders/new");
    return { data };
}
