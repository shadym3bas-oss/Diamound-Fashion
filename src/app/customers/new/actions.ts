
"use server";

import { getSupabaseAdmin } from "@/lib/supabase-client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CustomerSchema = z.object({
    name: z.string(),
    phone: z.string().optional(),
    email: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal('')),
});

export async function addCustomer(values: z.infer<typeof CustomerSchema>) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from("customers")
        .insert([
            { 
                name: values.name, 
                phone: values.phone, 
                email: values.email || null 
            }
        ])
        .select();

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/customers");
    revalidatePath("/orders/new");
    return { data };
}
