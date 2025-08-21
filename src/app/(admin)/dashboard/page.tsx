import Link from "next/link";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { getSupabaseAdmin } from "@/lib/supabase-client";
import { MonthlyRevenueChart } from "@/components/dashboard/monthly-revenue-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type MonthlyRevenue = {
  month: string;
  total: number;
};

export default async function Page() {

  const supabase = getSupabaseAdmin();

  const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();

  const [
    totalOrdersRes,
    newCustomersRes,
    lowStockProductsRes,
    revenueDataRes,
    recentOrdersDataRes
  ] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('customers').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
    supabase.rpc('get_low_stock_products'),
    supabase.from('order_items').select('price, quantity'),
    supabase.from('orders').select('id, order_number, status, customers(name), created_at, order_items(price, quantity)').order('created_at', { ascending: false }).limit(5)
  ]);
  
  const totalOrders = totalOrdersRes.count ?? 0;
  const newCustomers = newCustomersRes.count ?? 0;
  const lowStockProducts = lowStockProductsRes.data ?? [];
  
  if (revenueDataRes.error) {
    console.error("Error fetching revenue data:", JSON.stringify(revenueDataRes.error, null, 2));
  }
  
  if (recentOrdersDataRes.error) {
    console.error("Error fetching recent orders:", JSON.stringify(recentOrdersDataRes.error, null, 2));
  }

  const totalRevenue = revenueDataRes.data?.reduce((sum, item) => sum + (item.price * item.quantity), 0) ?? 0;

  const stats = {
    totalRevenue,
    newOrders: totalOrders,
    lowStockProducts: lowStockProducts.length,
    newCustomers: newCustomers,
  };

  const recentOrders = (recentOrdersDataRes.data || []).map(o => ({
    id: o.id,
    order_number: o.order_number,
    status: o.status,
    customer: { name: o.customers?.name ?? 'N/A' },
    total: o.order_items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    date: o.created_at,
  }));
  
  const deliveredOrdersRes = await supabase.from('orders').select('created_at, order_items(price, quantity)').eq('status', 'delivered');
  const deliveredOrders = deliveredOrdersRes.data || [];

  const monthlyRevenueData = deliveredOrders.reduce((acc: MonthlyRevenue[], order: { created_at: string; order_items: { price: number; quantity: number }[] }) => {
    const date = new Date(order.created_at);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const orderTotal = order.order_items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const existingMonth = acc.find(item => item.month === month);

    if (existingMonth) {
      existingMonth.total += orderTotal;
    } else {
      acc.push({ month, total: orderTotal });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());


  return (
      <main className="grid flex-1 items-start gap-4 md:gap-8">
          <div className="flex items-center justify-between">
              <h1 className="text-3xl font-extrabold">لوحة التحكم</h1>
              <div className="flex gap-2">
                  <Button asChild>
                      <Link href="/orders/new">+ إضافة طلب</Link>
                  </Button>
                  <Button asChild variant="outline">
                      <Link href="/customers/new">+ إضافة عميل</Link>
                  </Button>
              </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <KpiCard title="إجمالي الإيرادات" value={`ج.م ${stats.totalRevenue.toFixed(2)}`} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
            <KpiCard title="إجمالي الطلبات" value={`${stats.newOrders}`} icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />} />
            <KpiCard title="منتجات قليلة المخزون" value={stats.lowStockProducts} icon={<Package className="h-4 w-4 text-muted-foreground" />} />
            <KpiCard title="عملاء جدد (آخر 30 يوم)" value={`+${stats.newCustomers}`} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
          </div>

          <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>نظرة عامة على الإيرادات</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <MonthlyRevenueChart data={monthlyRevenueData} />
              </CardContent>
            </Card>
            <RecentOrders orders={recentOrders} />
          </div>
      </main>
  );
}
