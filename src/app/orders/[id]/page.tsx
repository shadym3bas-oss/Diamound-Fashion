
import { getSupabaseAdmin } from "@/lib/supabase-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Printer } from "lucide-react";
import { OrderStatusActions } from "./_components/order-status-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardLayout from "@/components/dashboard-layout";

export default async function OrderDetails({ params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();
  const { data: order } = await supabase.from("orders").select("*, customers(name, phone)").eq("id", params.id).single();
  
  if (!order) return <div className="p-6">الطلب غير موجود</div>;
  
  const { data: items } = await supabase.from("order_items").select("*, product:products(name)").eq("order_id", order.id);

  const itemsList = items || [];
  const totalRevenue = itemsList.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline">قيد الانتظار</Badge>;
      case "confirmed": return <Badge className="bg-blue-500/10 text-blue-700">مؤكد</Badge>;
      case "shipped": return <Badge className="bg-indigo-500/10 text-indigo-700">تم الشحن</Badge>;
      case "delivered": return <Badge className="bg-emerald-500/10 text-emerald-700">تم التسليم</Badge>;
      case "cancelled": return <Badge variant="destructive">ملغي</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">تفاصيل الطلب #{order.order_number}</h1>
          <Button asChild variant="outline">
            <Link href={`/orders/${order.id}/invoice`} target="_blank">
              <Printer className="ml-2 h-4 w-4" />
              طباعة الفاتورة
            </Link>
          </Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>تغيير حالة الطلب</CardTitle>
            </CardHeader>
            <CardContent>
                <OrderStatusActions order={order} />
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle>العميل</CardTitle></CardHeader>
            <CardContent>
                <Link href={`/customers/${order.customer_id}`} className="text-primary hover:underline font-medium">
                <div>{order.customers?.name}</div>
                </Link>
                <div className="text-muted-foreground">{order.customers?.phone ?? "-"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>ملخص الطلب</CardTitle></CardHeader>
            <CardContent className="space-y-2">
                <div>الحالة: {getStatusBadge(order.status)}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm pt-2 border-t">
                    <span className="text-gray-700 font-bold text-base">إجمالي البيع:</span>
                    <span className="font-bold text-base text-right">{totalRevenue.toFixed(2)} ج.م</span>
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>تاريخ الطلب</CardTitle></CardHeader>
            <CardContent>
                <ol className="relative border-s border-gray-200 pr-4 space-y-3">
                     <li className="relative pr-5">
                        <span className="absolute right-0 top-1.5 size-2 rounded-full bg-primary"></span>
                        <div className="text-sm font-medium">تم إنشاء الطلب</div>
                        <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString("ar-EG", {dateStyle: 'short', timeStyle: 'short'})}</div>
                    </li>
                </ol>
            </CardContent>
          </Card>
        </div>

        <Card>
            <CardHeader><CardTitle>المنتجات المطلوبة</CardTitle></CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>سعر الوحدة</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {itemsList.map((it: any, i: number) => (
                    <tr key={i} className="border-b odd:bg-white even:bg-secondary/50">
                        <td className="p-3">{it.product?.name}</td>
                        <td className="p-3">{it.quantity}</td>
                        <td className="p-3">{Number(it.price).toFixed(2)}</td>
                        <td className="p-3 font-medium">{Number(it.price * it.quantity).toFixed(2)}</td>
                    </tr>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
