"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExpensesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ description: "", category: "", amount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    setIsLoading(true);
    const { data, error } = await supabase.from("expenses").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ variant: "destructive", title: "خطأ", description: error.message });
    } else {
      setRows(data || []);
    }
    setIsLoading(false);
  }

  async function addExpense() {
    if (!form.description || !form.amount) {
        toast({ variant: "destructive", title: "خطأ", description: "الوصف والمبلغ مطلوبان" });
        return;
    }
    const { error } = await supabase.from("expenses").insert([form]);
    if (error) {
       toast({ variant: "destructive", title: "خطأ", description: error.message });
    } else {
        toast({ title: "نجاح", description: "تمت إضافة المصروف" });
        setForm({ description: "", category: "", amount: 0 });
        setDialogOpen(false);
        load();
    }
  }

  async function deleteExpense(id: string) {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
         toast({ variant: "destructive", title: "خطأ", description: error.message });
    } else {
        toast({ title: "نجاح", description: "تم حذف المصروف" });
        load();
    }
  }

  useEffect(() => { load(); }, []);

  const TableSkeleton = () => (
     <div className="overflow-x-auto">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead><span className="sr-only">إجراء</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {[...Array(5)].map((_, i)=>(
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
    </div>
  )

  return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold self-start">المصروفات</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة مصروف جديد
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>إضافة مصروف جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="desc">الوصف</Label>
                        <Input id="desc" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="مثال: فاتورة كهرباء" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="cat">الفئة</Label>
                        <Input id="cat" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} placeholder="مثال: فواتير" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amount">المبلغ</Label>
                        <Input id="amount" type="number" value={form.amount} onChange={(e) => setForm({...form, amount: parseFloat(e.target.value) || 0})} />
                    </div>
                </div>
                <Button onClick={addExpense}>إضافة</Button>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>قائمة المصروفات</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? <TableSkeleton /> : (
                  <div className="overflow-x-auto">
                  <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>التاريخ</TableHead>
                          <TableHead>الوصف</TableHead>
                          <TableHead>الفئة</TableHead>
                          <TableHead>المبلغ</TableHead>
                          <TableHead><span className="sr-only">إجراء</span></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                      {rows.map((r)=>(
                          <TableRow key={r.id}>
                            <TableCell>{new Date(r.created_at).toLocaleDateString('ar-EG')}</TableCell>
                            <TableCell className="font-medium">{r.description}</TableCell>
                            <TableCell>{r.category}</TableCell>
                            <TableCell>{Number(r.amount).toFixed(2)} ج.م</TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف المصروف بشكل دائم.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteExpense(r.id)}>متابعة</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                      ))}
                      {rows.length===0 && <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">لا توجد مصروفات بعد.</TableCell></TableRow>}
                      </TableBody>
                  </Table>
                  </div>
                )}
            </CardContent>
        </Card>
      </div>
  );
}
