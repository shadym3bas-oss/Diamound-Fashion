
"use client";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
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
import { addReturn, getOrderItems } from "../actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  order_id: z.string({required_error: "يجب اختيار طلب"}).uuid("يجب اختيار طلب صالح"),
  items: z.array(z.object({
    order_item_id: z.string().uuid(),
    product_id: z.string().uuid(),
    quantity: z.coerce.number().min(1, "الكمية المرتجعة يجب أن تكون 1 على الأقل"),
  })).min(1, "يجب إرجاع منتج واحد على الأقل"),
  reason: z.string().optional(),
});

type ReturnFormProps = {
    orders: {id: string, label: string}[];
}

type OrderItem = {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    products: { name: string; } | null
}

export function ReturnForm({ orders }: ReturnFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<{[key: string]: boolean}>({});
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      order_id: undefined,
      items: [],
      reason: ""
    },
  });

  const { replace } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const watchedItems = form.watch("items");
  const orderId = useWatch({ control: form.control, name: "order_id" });

  useEffect(() => {
    const fetchOrderItems = async () => {
        if (!orderId) {
            setOrderItems([]);
            return;
        }
        setIsLoadingItems(true);
        const { data } = await getOrderItems(orderId);
        setOrderItems(data || []);
        setSelectedItems({});
        replace([]); // Clear the form array when order changes
        setIsLoadingItems(false);
    }
    fetchOrderItems();
  }, [orderId, replace]);

  useEffect(() => {
    const newFormItems = [];
    for (const itemId in selectedItems) {
        if (selectedItems[itemId]) {
            const orderItem = orderItems.find(i => i.id === itemId);
            if (orderItem) {
                newFormItems.push({
                    order_item_id: orderItem.id,
                    product_id: orderItem.product_id,
                    quantity: 1, // Default to 1
                });
            }
        }
    }
    replace(newFormItems);
  }, [selectedItems, orderItems, replace]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await addReturn(values);
    if (result.error) {
      toast({ variant: "destructive", title: "حدث خطأ", description: result.error });
    } else {
      toast({ title: "نجاح!", description: "تم تسجيل المرتجع بنجاح." });
      router.push('/returns');
    }
  }
  
  const handleItemSelection = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => ({...prev, [itemId]: checked }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>تفاصيل المرتجع</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
            control={form.control}
            name="order_id"
            render={({ field }) => (
                <FormItem className="flex-grow">
                <FormLabel>اختر الطلب الأصلي</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={orders.length === 0}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="اختر طلبًا لإجراء مرتجع عليه" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {orders.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            
            {isLoadingItems && <div className="flex items-center justify-center p-6"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
            
            {orderItems.length > 0 && !isLoadingItems && (
                <div>
                    <Label>المنتجات المتاحة للإرجاع</Label>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>المنتج</TableHead>
                                    <TableHead>الكمية بالطلب</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orderItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Checkbox 
                                                checked={!!selectedItems[item.id]} 
                                                onCheckedChange={(checked) => handleItemSelection(item.id, !!checked)}
                                            />
                                        </TableCell>
                                        <TableCell>{item.products?.name}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {watchedItems.length > 0 && (
                 <div>
                    <Label>المنتجات المرتجعة</Label>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>المنتج</TableHead>
                                    <TableHead>الكمية المرتجعة</TableHead>
                                    <TableHead><span className="sr-only">إجراءات</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {watchedItems.map((field, index) => {
                                    const orderItem = orderItems.find(i => i.product_id === field.product_id);
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>{orderItem?.products?.name}</TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.quantity`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input 
                                                                    type="number" 
                                                                    {...field} 
                                                                    max={orderItem?.quantity || 1} 
                                                                    min={1}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleItemSelection(orderItem!.id, false)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    {form.formState.errors.items && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.items.message}</p>}
                </div>
            )}
            
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب الإرجاع (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="سبب الإرجاع، حالة المنتج، إلخ." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={form.formState.isSubmitting || watchedItems.length === 0}>
                {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {form.formState.isSubmitting ? "جاري التسجيل..." : "تسجيل المرتجع"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
