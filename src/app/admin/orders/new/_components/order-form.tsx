"use client";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { addOrder } from "../actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CustomerForm } from "@/app/admin/customers/new/_components/customer-form";
import { ProductForm } from "@/app/admin/products/new/_components/product-form";
import { useRouter } from "next/navigation";


const formSchema = z.object({
  customer_id: z.string({required_error: "العميل مطلوب"}).uuid("العميل مطلوب"),
  items: z.array(z.object({
    product_id: z.string({required_error: "المنتج مطلوب"}).uuid("المنتج مطلوب"),
    quantity: z.coerce.number().min(1, "الكمية يجب أن تكون 1 على الأقل"),
    price: z.coerce.number().min(0, "السعر لا يمكن أن يكون سالبًا"),
  })).min(1, "يجب إضافة منتج واحد على الأقل"),
});

type OrderFormProps = {
    customers: {id: string, name: string}[];
    products: {id: string, name: string, price: number | null}[];
}

export function OrderForm({ customers, products }: OrderFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_id: undefined,
      items: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const watchedItems = form.watch("items");

  const total = watchedItems.reduce((acc, current) => acc + (current.price || 0) * (current.quantity || 0), 0);

  const handleProductChange = (productId: string, index: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const currentItem = form.getValues(`items.${index}`);
      update(index, {
        ...currentItem,
        product_id: productId,
        price: product.price ?? 0
      });
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await addOrder(values);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: result.error,
      });
    } else {
      toast({
        title: "نجاح!",
        description: "تمت إضافة الطلب بنجاح.",
      });
      window.location.href = '/admin/orders';
    }
  }

  const handleSuccess = () => {
    router.refresh();
    setCustomerDialogOpen(false);
    setProductDialogOpen(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>تفاصيل الطلب</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex items-end gap-2">
                <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                    <FormItem className="flex-grow">
                    <FormLabel>العميل</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={customers.length === 0}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="اختر عميلاً" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
                    <DialogTrigger asChild>
                       <Button type="button" variant="outline">
                            <PlusCircle className="ml-2 h-4 w-4" />
                            إضافة عميل
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>إضافة عميل جديد</DialogTitle>
                        </DialogHeader>
                        <CustomerForm onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </div>
            
            <div>
                <Label>المنتجات</Label>
                <div className="border rounded-md mt-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">المنتج</TableHead>
                                <TableHead>السعر</TableHead>
                                <TableHead>الكمية</TableHead>
                                <TableHead>الإجمالي</TableHead>
                                <TableHead><span className="sr-only">إجراءات</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((field, index) => (
                                <TableRow key={field.id} className="odd:bg-white even:bg-secondary/50">
                                <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.product_id`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select onValueChange={(value) => {
                                                        field.onChange(value);
                                                        handleProductChange(value, index);
                                                    }} defaultValue={field.value} disabled={products.length === 0}>
                                                        <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="اختر منتجًا" />
                                                        </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                            />
                                </TableCell>
                                <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.price`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                            />
                                </TableCell>
                                <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                            />
                                </TableCell>
                                    <TableCell className="font-medium">
                                        {(watchedItems[index]?.price * watchedItems[index]?.quantity || 0).toFixed(2)} ج.م
                                    </TableCell>
                                <TableCell>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                                </TableRow>
                            ))}
                            {fields.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        لم يتم إضافة أي منتجات.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                 <div className="flex items-center gap-2 mt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => append({product_id: '', price: 0, quantity: 1 })} disabled={products.length === 0}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        إضافة منتج
                    </Button>
                    
                    <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline" size="sm">
                                <PlusCircle className="ml-2 h-4 w-4" />
                                إنشاء منتج جديد
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                            <DialogTitle>إضافة منتج جديد</DialogTitle>
                            </DialogHeader>
                            <ProductForm onSuccess={handleSuccess}/>
                        </DialogContent>
                    </Dialog>
                </div>
                {form.formState.errors.items && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.items.message}</p>}
            </div>

            <div className="flex justify-end items-center gap-4 pt-4 border-t">
                <div className="text-xl font-bold">الإجمالي: {total.toFixed(2)} ج.م</div>
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {form.formState.isSubmitting ? "جاري الإضافة..." : "إضافة طلب"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
