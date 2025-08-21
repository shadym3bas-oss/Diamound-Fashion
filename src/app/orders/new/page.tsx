import DashboardLayout from "@/components/dashboard-layout";
import { getSupabaseAdmin } from "@/lib/supabase-client";
import { OrderForm } from "./_components/order-form";

export default async function NewOrderPage() {
    const supabase = getSupabaseAdmin();

    const { data: customers } = await supabase.from('customers').select('id, name');
    const { data: products } = await supabase.from('products').select('id, name, price');

    return (
        <DashboardLayout>
            <h1 className="text-3xl font-extrabold mb-6">إضافة طلب جديد</h1>
            <OrderForm customers={customers || []} products={products || []} />
        </DashboardLayout>
    )
}
