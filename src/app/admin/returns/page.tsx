"use client";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    setIsLoading(true);
    const { data: r, error } = await supabase
      .from("returns")
      .select("*, order:orders(order_number, customers(name))")
      .order("created_at", { ascending: false });
    
    if (error) {
      toast({ variant: "destructive", title: "خطأ في تحميل المرتجعات", description: JSON.stringify(error, null, 2) });
    } else {
      setReturns(r || []);
    }
    setIsLoading(false);
  }

  useEffect(() => { load(); }, []);

  const TableSkeleton = () => (
     <div className="overflow-x-auto">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>تاريخ المرتجع</TableHead>
                <TableHead>رقم الطلب الأصلي</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>سبب الإرجاع</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
    </div>
  )

  return (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl font-bold self-start">المرتجعات</h1>
            <Link href="/admin/returns/new">
              <Button className="w-full md:w-auto">
                <PlusCircle className="ml-2 h-4 w-4" />
                إضافة مرتجع جديد
              </Button>
            </Link>
          </div>

          <Card>
              <CardHeader>
                  <CardTitle>قائمة المرتجعات</CardTitle>
              </CardHeader>
              <CardContent>
                  {isLoading ? <TableSkeleton /> : (
                    <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>تاريخ المرتجع</TableHead>
                            <TableHead>رقم الطلب الأصلي</TableHead>
                            <TableHead>العميل</TableHead>
                            <TableHead>سبب الإرجاع</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {returns.map((r) => (
                            <TableRow key={r.id}>
                                <TableCell>{new Date(r.created_at).toLocaleDateString('ar-EG')}</TableCell>
                                <TableCell className="font-mono">
                                    <Link href={`/admin/orders/${r.order_id}`} className="hover:underline text-primary">
                                        #{r.order?.order_number}
                                    </Link>
                                </TableCell>
                                <TableCell>{r.order?.customers?.name ?? 'غير محدد'}</TableCell>
                                <TableCell>{r.reason || '-'}</TableCell>
                            </TableRow>
                        ))}
                        {returns.length === 0 && (
                            <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                لا توجد مرتجعات مسجلة بعد.
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
