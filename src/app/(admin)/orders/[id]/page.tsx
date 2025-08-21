
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { OrderStatusActions } from "./_components/order-status-actions";
import { deleteOrder } from "./actions";
import { Badge } from "@/components/ui/badge";

export default function OrderDetails() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
        fetchOrder();
    }
  }, [id]);

  async function fetchOrder() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, customer:customers(name, phone, address), order_items(*, product:products(name, price))")
      .eq("id", id)
      .single();

    if (error) {
        console.error(error);
        setIsLoading(false);
    } else {
        const orderTotal = data.order_items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        setOrder({...data, total_amount: orderTotal});
        setIsLoading(false);
    }
  }

  const handleDelete = async () => {
    const result = await deleteOrder(order.id);
    if(result.error) {
       toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: "لم يتم حذف الطلب. " + result.error,
      });
    } else {
       toast({
        title: "نجاح!",
        description: "تم حذف الطلب بنجاح.",
      });
      router.push("/orders");
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


  if (isLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/2" />
            <div className="space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-1/4" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                </CardContent>
            </Card>
            <div className="text-right">
                <Skeleton className="h-7 w-1/4" />
            </div>
        </div>
    );
  }

  if (!order) return <p className="text-center text-muted-foreground">لم يتم العثور على الطلب.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-4">
              <span>تفاصيل الطلب #{order.order_number}</span>
              {getStatusBadge(order.status)}
            </h1>
            <p className="text-muted-foreground mt-2">
              تاريخ الإنشاء: {new Date(order.created_at).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' })}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-end">
             <Link href={`/orders/${order.id}/invoice`} target="_blank">
                <Button variant="outline">
                    <Printer className="ml-2 h-4 w-4"/>
                    طباعة الفاتورة
                </Button>
            </Link>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="ml-2 h-4 w-4" />
                  حذف
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف الطلب بشكل دائم.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>متابعة</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
              <CardTitle>المنتجات المطلوبة</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {order.order_items.map((item: any, i: number) => (
                <li key={i} className="flex justify-between items-center text-sm">
                  <span className="font-medium">
                    {item.product?.name || `منتج محذوف (${item.id})`}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {item.quantity} × {Number(item.price).toFixed(2)} ج.م
                  </span>
                   <span className="font-bold">
                    {(Number(item.price) * item.quantity).toFixed(2)} ج.م
                  </span>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <div className="flex justify-end font-bold text-lg">
                <p>الإجمالي: {Number(order.total_amount).toFixed(2)} ج.م</p>
            </div>
          </CardContent>
        </Card>
         <div className="space-y-6">
            <Card>
              <CardHeader>
                  <CardTitle>بيانات العميل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                  <p><span className="font-semibold text-foreground">العميل:</span> {order.customer.name}</p>
                  <p><span className="font-semibold text-foreground">الهاتف:</span> {order.customer.phone}</p>
                   <p><span className="font-semibold text-foreground">العنوان:</span> {order.customer.address || 'غير محدد'}</p>
                   <Button asChild variant="link" className="p-0 h-auto">
                    <Link href={`/customers/${order.customer_id}`}>عرض سجل العميل</Link>
                   </Button>
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                  <CardTitle>تغيير حالة الطلب</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderStatusActions order={order} />
              </CardContent>
            </Card>
          </div>
      </div>
    </div>
  );
}
