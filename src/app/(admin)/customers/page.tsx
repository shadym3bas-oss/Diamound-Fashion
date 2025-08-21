
"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    setIsLoading(true);
    const { data, error } = await supabase.from("customers").select("id, name, phone, email").order("name");
    if (error) {
      toast({ variant: "destructive", title: "خطأ", description: error.message });
    } else {
      setRows(data || []);
    }
    setIsLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    return rows.filter(row => 
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.phone && row.phone.includes(searchTerm))
    );
  }, [rows, searchTerm]);

  const TableSkeleton = () => (
    <div className="overflow-x-auto">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  );

  return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold self-start">العملاء</h1>
           <Link href="/customers/new">
            <Button className="w-full md:w-auto">
              <PlusCircle className="ml-2 h-4 w-4" />
              إضافة عميل جديد
            </Button>
          </Link>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>قائمة العملاء</CardTitle>
                 <div className="relative mt-2">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="ابحث بالاسم أو رقم الهاتف..." 
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
                            <TableHead>الاسم</TableHead>
                            <TableHead>الهاتف</TableHead>
                            <TableHead>البريد الإلكتروني</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredRows.map((r,i)=>(
                            <TableRow key={r.id} className="hover:bg-muted/50">
                              <TableCell>{i+1}</TableCell>
                              <TableCell className="font-medium">
                                <Link href={`/customers/${r.id}`} className="hover:underline text-primary">
                                    {r.name}
                                </Link>
                              </TableCell>
                              <TableCell>{r.phone || '-'}</TableCell>
                              <TableCell>{r.email || '-'}</TableCell>
                            </TableRow>
                        ))}
                        {filteredRows.length===0 && <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">لا توجد نتائج مطابقة للبحث.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
  );
}
