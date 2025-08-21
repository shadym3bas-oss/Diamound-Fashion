
"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Edit, PlusCircle, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { deleteProduct } from "./actions";
import { useRouter } from "next/navigation";


export default function ProductsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustmentValue, setAdjustmentValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    setIsLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("name");
    if (error) {
        toast({ variant: "destructive", title: "خطأ", description: error.message });
    } else {
        setRows(data || []);
    }
    setIsLoading(false);
  }

  async function handleAdjustStock() {
    if (!selectedProduct || !adjustmentValue) {
        toast({variant: "destructive", title: "خطأ", description: "الرجاء إدخال قيمة صالحة."});
        return;
    };
    
    const newStock = selectedProduct.stock + adjustmentValue;

    const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', selectedProduct.id);

    if (error) {
        toast({ variant: "destructive", title: "خطأ في تحديث المخزون", description: error.message });
    } else {
        toast({ title: "نجاح", description: "تم تحديث المخزون بنجاح" });
        load();
        setDialogOpen(false);
        setAdjustmentValue(0);
        setSelectedProduct(null);
    }
  }

  async function handleDeleteProduct(id: string) {
    const result = await deleteProduct(id);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: "لا يمكن حذف المنتج لارتباطه بطلبات. يجب حذف الطلبات المرتبطة به أولاً.",
      });
    } else {
      toast({
        title: "نجاح!",
        description: "تم حذف المنتج بنجاح.",
      });
      router.refresh();
    }
  }

  useEffect(()=>{ load(); },[]);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    return rows.filter(row => 
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);


  const TableSkeleton = () => (
     <div className="overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>المنتج</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>المخزون الحالي</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  );


  return (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl font-bold self-start">المنتجات والمخزون</h1>
            <Link href="/products/new">
              <Button className="w-full md:w-auto">
                <PlusCircle className="ml-2 h-4 w-4" />
                إضافة منتج جديد
              </Button>
            </Link>
          </div>

          <Card>
              <CardHeader>
                  <CardTitle>قائمة المنتجات</CardTitle>
                  <div className="relative mt-2">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                          placeholder="ابحث بالاسم أو SKU..." 
                          className="w-full md:w-1/3 pr-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </div>
              </CardHeader>
              <CardContent>
                  {isLoading ? <TableSkeleton /> : (
                    <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>المنتج</TableHead>
                            <TableHead>السعر</TableHead>
                            <TableHead>المخزون الحالي</TableHead>
                            <TableHead className="text-center">الإجراءات</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredRows.map((r,i)=>(
                            <TableRow key={r.id}>
                              <TableCell>{i+1}</TableCell>
                              <TableCell>
                                  <div className="font-medium">{r.name}</div>
                                  <div className="text-sm text-muted-foreground">({r.sku})</div>
                              </TableCell>
                              <TableCell>{Number(r.price).toFixed(2)} ج.م</TableCell>
                              <TableCell className="font-medium">{r.stock ?? 0}</TableCell>
                              <TableCell className="text-center space-x-2">
                                  <Button 
                                    onClick={() => { setSelectedProduct(r); setDialogOpen(true); }} 
                                    size="sm" 
                                    variant="outline"
                                    >
                                    <Edit className="ml-2 h-4 w-4"/>
                                    تعديل
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="sm">
                                          <Trash2 className="ml-2 h-4 w-4" />
                                          حذف
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف المنتج بشكل دائم.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteProduct(r.id)}>متابعة</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                              </TableCell>
                            </TableRow>
                        ))}
                        {filteredRows.length===0 && <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">لا توجد منتجات تطابق البحث.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                    </div>
                  )}
              </CardContent>
          </Card>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>تعديل مخزون: {selectedProduct?.name}</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="adjust">الكمية المراد تعديلها</Label>
                    <Input 
                      id="adjust"
                      type="number"
                      value={adjustmentValue}
                      onChange={(e) => setAdjustmentValue(parseInt(e.target.value, 10))}
                      placeholder="ادخل رقمًا موجبًا للإضافة وسالبًا للخصم"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      الكمية الحالية: {selectedProduct?.stock}. بعد التعديل: {selectedProduct?.stock + (adjustmentValue || 0)}
                    </p>
                  </div>
                  <Button onClick={handleAdjustStock}>حفظ التعديل</Button>
              </DialogContent>
          </Dialog>

        </div>
  );
}
