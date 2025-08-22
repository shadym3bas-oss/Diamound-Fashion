import { getSupabaseAdmin } from "@/lib/supabase-client";
import { ReturnForm } from "./_components/return-form";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";

export default async function NewReturnPage() {
    const supabase = getSupabaseAdmin();

    const { data: ordersData } = await supabase.from('orders')
        .select('id, order_number, customers(name)')
        .order('created_at', { ascending: false });
    
    const orders = ordersData?.map(o => ({
        id: o.id,
        label: `#${o.order_number} - ${o.customers?.name ?? 'غير محدد'}`
    })) || [];


    return (
            <div className="space-y-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/admin/returns">المرتجعات</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>إضافة مرتجع جديد</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <h1 className="text-3xl font-extrabold">إضافة مرتجع جديد</h1>
                <ReturnForm orders={orders} />
            </div>
    )
}
