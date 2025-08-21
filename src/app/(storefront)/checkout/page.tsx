
"use client";

import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { createOrder } from "./actions";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  phone: z.string().min(10, "رقم هاتف صالح مطلوب"),
  address: z.string().min(5, "العنوان مطلوب"),
});

export default function CheckoutPage() {
    const { cartItems, clearCart } = useCart();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            phone: "",
            address: "",
        },
    });

    const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (cartItems.length === 0) {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: "سلة التسوق فارغة!",
            });
            return;
        }

        const result = await createOrder({
            customer: values,
            items: cartItems.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.price || 0,
            })),
        });

        if (result.error) {
             toast({
                variant: "destructive",
                title: "حدث خطأ أثناء إنشاء الطلب",
                description: result.error,
            });
        } else {
            toast({
                title: "تم استلام طلبك بنجاح!",
                description: `شكرًا لك، طلبك رقم #${result.data?.order_number} قيد المراجعة.`,
            });
            clearCart();
            router.push(`/order-success?order_id=${result.data?.id}`);
        }
    }

     if (cartItems.length === 0 && !form.formState.isSubmitting) {
        return (
             <div className="container mx-auto px-6 py-10 text-center">
                <h1 className="text-2xl font-bold">لا يوجد شيء لإتمام طلبه</h1>
                <p className="text-muted-foreground mt-2">سلة التسوق فارغة حاليًا.</p>
                <Button asChild className="mt-4">
                    <a href="/">العودة إلى المتجر</a>
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-6 py-10">
            <h1 className="text-3xl font-extrabold mb-6">إتمام الطلب</h1>

            <div className="grid lg:grid-cols-2 gap-12">
                <div>
                     <h2 className="text-xl font-bold mb-4">بيانات الشحن</h2>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-card p-6 rounded-2xl border">
                             <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>الاسم الكامل</FormLabel>
                                    <FormControl><Input placeholder="الاسم الكامل" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>رقم الهاتف</FormLabel>
                                    <FormControl><Input placeholder="رقم الهاتف" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>العنوان بالتفصيل</FormLabel>
                                    <FormControl><Input placeholder="المدينة - المنطقة - الشارع - رقم المبنى" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                {form.formState.isSubmitting ? "جاري إنشاء الطلب..." : `تأكيد الطلب والدفع (${total.toFixed(2)} ج.م)`}
                            </Button>
                        </form>
                    </Form>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4">ملخص الطلب</h2>
                     <Card>
                        <CardHeader>
                            <CardTitle>المنتجات</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-4">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Image 
                                                src={item.image_url || 'https://placehold.co/64x64.png'} 
                                                alt={item.name} 
                                                width={64} 
                                                height={64} 
                                                className="rounded-md object-cover border"
                                            />
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">الكمية: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-semibold">{(Number(item.price) * item.quantity).toFixed(2)} ج.م</p>
                                    </div>
                                ))}
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <p>الإجمالي</p>
                                    <p>{total.toFixed(2)} ج.م</p>
                                </div>
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
