"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteProduct } from "./actions";
import { Badge } from "@/components/ui/badge";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setIsLoading(true);
    const { data, error } = await supabase.from("products").select("id, name, price, stock, image_urls").order("name");
    if (error) {
      console.error(error);
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  }
  
  async function handleDelete(productId: string) {
      const result = await deleteProduct(productId);
      if (result.error) {
          toast({
              variant: "destructive",
              title: "حدث خطأ",
              description: "لا يمكن حذف المنتج لأنه مرتبط بطلبات. يجب حذف الطلبات المرتبطة به أولاً.",
          })
      } else {
          toast({
              title: "نجاح",
              description: "تم حذف المنتج بنجاح."
          });
          fetchProducts();
      }
  }

  const getStockBadge = (stock: number) => {
      if (stock === 0) {
          return <Badge variant="destructive">نفدت الكمية</Badge>
      }
      if (stock < 5) {
          return <Badge variant="outline" className="text-amber-600 border-amber-500">مخزون منخفض</Badge>
      }
      return <Badge variant="secondary">{stock}</Badge>
  }

  const TableSkeleton = () => (
    <div className="overflow-x-auto">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الصورة</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead><span className="sr-only">إجراءات</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                       <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold self-start">المنتجات</h1>
        <Link href="/admin/products/new">
          <Button className="w-full md:w-auto">
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة منتج جديد
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>قائمة المنتجات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <TableSkeleton /> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الصورة</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Image 
                            src={p.image_urls?.[0] || `https://placehold.co/64x64.png`} 
                            alt={p.name} 
                            width={64} 
                            height={64} 
                            className="rounded-md object-cover border"
                            data-ai-hint="fashion clothing"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{Number(p.price).toFixed(2)} ج.م</TableCell>
                      <TableCell>{getStockBadge(p.stock)}</TableCell>
                       <TableCell className="text-left">
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    <Trash2 className="ml-2 h-4 w-4" />
                                    حذف المنتج
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>هل أنت متأكد من حذف المنتج؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                    هذا الإجراء سيقوم بحذف المنتج بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(p.id)}>نعم، قم بالحذف</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                       </TableCell>
                    </TableRow>
                  ))}
                  {products.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            لا توجد منتجات لعرضها.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
