import { getSupabaseAdmin } from "@/lib/supabase-client";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Users, ShoppingCart, DollarSign } from "lucide-react";

export default async function Page() {
  const supabase = getSupabaseAdmin();
  
  const [
    { count: customers }, 
    { count: orders }, 
    { data: sales, error: salesError }
  ] = await Promise.all([
      supabase.from("customers").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("order_items").select("price, quantity"),
    ]);

  if (salesError) {
      console.error("Error fetching sales data:", salesError);
  }

  const totalSales = sales?.reduce(
    (acc, row) => acc + (row.price || 0) * (row.quantity || 0),
    0
  ) || 0;

  const stats = { 
    customers: customers ?? 0, 
    orders: orders ?? 0, 
    totalSales 
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold mb-6">لوحة التحكم</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="عدد العملاء" value={stats.customers} icon={<Users className="h-5 w-5 text-muted-foreground" />} />
        <KpiCard title="عدد الطلبات" value={stats.orders} icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />} />
        <KpiCard title="إجمالي المبيعات" value={`${stats.totalSales.toFixed(2)} ج.م`} icon={<DollarSign className="h-5 w-5 text-muted-foreground" />} />
      </div>
    </div>
  );
}
