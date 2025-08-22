"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { deleteOrder, updateOrderStatus } from "../[id]/actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


export function OrdersTable({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [whatsappTemplates, setWhatsappTemplates] = useState<{[key: string]: string}>({});

  useEffect(() => {
    setOrders(initialOrders);
    const savedTemplates = localStorage.getItem('whatsapp_templates');
    if (savedTemplates) {
      setWhatsappTemplates(JSON.parse(savedTemplates));
    }
  }, [initialOrders]);


  async function handleUpdateStatus(id: string, status: string) {
    const result = await updateOrderStatus({ id, status: status as any });
    if (result.error) {
      toast({ variant: "destructive", title: "خطأ في تحديث الحالة", description: result.error });
    } else {
      toast({ title: "نجاح", description: `تم تحديث حالة الطلب بنجاح`});
      router.refresh(); 
    }
  }
  
  async function handleDeleteOrder(id: string) {
    const result = await deleteOrder(id);
     if (result.error) {
      toast({ variant: "destructive", title: "خطأ في حذف الطلب", description: result.error });
    } else {
      toast({ title: "نجاح", description: `تم حذف الطلب بنجاح`});
      router.refresh(); 
    }
  }

  const waUrl = (phone: string | undefined, msg: string) => {
    if (!phone) return '#';
    let cleanPhone = phone.replace(/\s+/g, '');
    if (cleanPhone.startsWith('0')) {
        cleanPhone = '2' + cleanPhone;
    }
    if (!cleanPhone.startsWith('2') && cleanPhone.length === 11) {
        cleanPhone = '2' + cleanPhone;
    }
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  }

  const getWhatsappMessage = (order: any) => {
    const template = whatsappTemplates[order.status] || "مرحباً، طلبك رقم #{order_number} حالته الآن: {status_translated}";
    return template
        .replace('{customer_name}', order.customer?.name || 'عميلنا العزيز')
        .replace('{order_number}', order.order_number)
  }

  const filteredOrders = useMemo(() => {
    if (filterStatus === "All") {
      return orders;
    }
    return orders.filter(o => o.status === filterStatus);
  }, [orders, filterStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="cursor-pointer">قيد الانتظار</Badge>;
      case "confirmed": return <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 cursor-pointer">مؤكد</Badge>;
      case "shipped": return <Badge className="bg-indigo-500/10 text-indigo-700 hover:bg-indigo-500/20 cursor-pointer">تم الشحن</Badge>;
      case "delivered": return <Badge className="bg-emerald-500/10 text-emerald-700 cursor-pointer">تم التسليم</Badge>;
      case "cancelled": return <Badge variant="destructive" className="cursor-pointer">ملغي</Badge>;
      default: return <Badge variant="secondary" className="cursor-pointer">{status}</Badge>;
    }
  }
  
  const allStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  const statusTranslations: { [key: string]: string } = {
    'pending': 'قيد الانتظار',
    'confirmed': 'مؤكد',
    'shipped': 'تم الشحن',
    'delivered': 'تم التسليم',
    'cancelled': 'ملغي'
  };

  const TableSkeleton = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>العميل</TableHead>
            <TableHead>الإجمالي</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>تاريخ الإنشاء</TableHead>
            <TableHead><span className="sr-only">إجراءات</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-8 w-8" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
      <div>
         <div className="p-4 border-b">
              <Select onValueChange={setFilterStatus} defaultValue="All">
                  <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="فلترة حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="All">كل الحالات</SelectItem>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="confirmed">مؤكد</SelectItem>
                      <SelectItem value="shipped">تم الشحن</SelectItem>
                      <SelectItem value="delivered">تم التسليم</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
              </Select>
          </div>
          {isLoading ? <TableSkeleton /> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>الإجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((o) => (
                    <TableRow key={o.id} className="odd:bg-white even:bg-secondary/50">
                      <TableCell className="font-mono">
                        <Link href={`/admin/orders/${o.id}`} className="hover:underline text-primary">
                            #{o.order_number}
                        </Link>
                      </TableCell>
                      <TableCell>{o.customer?.name ?? 'غير محدد'}</TableCell>
                       <TableCell>{Number(o.total || 0).toFixed(2)} ج.م</TableCell>
                      <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                {getStatusBadge(o.status)}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                               {allStatuses.map(status => (
                                <DropdownMenuItem key={status} onClick={() => handleUpdateStatus(o.id, status)} disabled={o.status === status}>
                                  {statusTranslations[status]}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                      <TableCell>{new Date(o.created_at).toLocaleDateString('ar-EG')}</TableCell>
                      <TableCell className="text-left">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">فتح القائمة</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild><Link href={`/admin/orders/${o.id}`}>عرض التفاصيل</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href={`/admin/orders/${o.id}/invoice`} target="_blank">طباعة الفاتورة</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a href={waUrl(o.customer?.phone, getWhatsappMessage(o))} target="_blank" rel="noopener noreferrer">
                                  إرسال واتساب
                                </a>
                              </DropdownMenuItem>
                               <DropdownMenuSeparator />
                               <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10">
                                    <Trash2 className="ml-2 h-4 w-4"/>
                                    حذف الطلب
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>هل أنت متأكد من حذف الطلب؟</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هذا الإجراء سيقوم بحذف الطلب وجميع المنتجات المرتبطة به بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteOrder(o.id)}>نعم، قم بالحذف</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        لا توجد طلبات تطابق الفلتر المحدد.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
  );
}
