
"use client";
import { supabase } from "@/lib/supabase-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Phone, User, Trash2 } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteCustomer } from "./actions";
import { useRouter } from "next/navigation";

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const [customer, setCustomer] = useState<any>(null);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: customerData } = await supabase.from("customers").select("*").eq("id", params.id).single();
      
      if (!customerData) {
        setLoading(false);
        return;
      }
      setCustomer(customerData);

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*, order_items(price, quantity)")
        .eq("customer_id", customerData.id)
        .order("created_at", { ascending: false });

      const orders = (ordersData || []).map(o => ({
          ...o,
          total: o.order_items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }));
      setOrdersList(orders);
      setTotalPurchases(orders.reduce((acc, order) => acc + (order.total || 0), 0));
      setLoading(false);
    }
    loadData();
  }, [params.id]);

  if (loading) {
      return <DashboardLayout><div>جاري التحميل...</div></DashboardLayout>
  }
  
  if (!customer) return <DashboardLayout><div className="p-6">العميل غير موجود</div></DashboardLayout>;

  const handleDelete = async () => {
    const result = await deleteCustomer(customer.id);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: "لا يمكن حذف العميل لارتباطه بطلبات. يجب حذف الطلبات المرتبطة به أولاً.",
      });
    } else {
      toast({
        title: "نجاح!",
        description: "تم حذف العميل بنجاح.",
      });
      router.push("/customers");
    }
  };

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
          <h1 className="text-3xl font-extrabold">تفاصيل حساب العميل</h1>
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="ml-2 h-4 w-4" />
                حذف العميل
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
                <AlertDialogDescription>
                  هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف العميل وجميع الطلبات المرتبطة به بشكل دائم.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>متابعة</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-6 h-6" />
                        <span>{customer.name}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                   <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{customer.phone || 'لا يوجد'}</span>
                   </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{customer.email || 'لا يوجد بريد إلكتروني'}</span>
                   </div>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>الملخص المالي</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 text-center">
                    <div>
                        <p className="text-muted-foreground text-sm">إجمالي المشتريات</p>
                        <p className="text-2xl font-bold">{totalPurchases.toFixed(2)} ج.م</p>
                    </div>
                </CardContent>
            </Card>
        </div>


        <Card>
            <CardHeader>
                <CardTitle>تاريخ الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>رقم الطلب</TableHead>
                            <TableHead>الحالة</TableHead>
                            <TableHead>التاريخ</TableHead>
                            <TableHead>الإجمالي</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ordersList.map(order => (
                            <TableRow key={order.id}>
                                <TableCell>
                                    <Link href={`/orders/${order.id}`} className="font-mono hover:underline text-primary">
                                        #{order.order_number}
                                    </Link>
                                </TableCell>
                                <TableCell>{getStatusBadge(order.status)}</TableCell>
                                <TableCell>{new Date(order.created_at).toLocaleDateString('ar-EG')}</TableCell>
                                <TableCell>{(order.total || 0).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        {ordersList.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    لا توجد طلبات لهذا العميل.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
