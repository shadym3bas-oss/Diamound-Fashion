
"use client";

import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

    const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-6 py-10 text-center">
                <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground" />
                <h1 className="mt-4 text-3xl font-bold">سلة التسوق فارغة</h1>
                <p className="mt-2 text-muted-foreground">لم تقم بإضافة أي منتجات بعد.</p>
                <Button asChild className="mt-6">
                    <Link href="/">
                        تصفح المنتجات
                    </Link>
                </Button>
            </div>
        );
    }


    return (
        <div className="container mx-auto px-6 py-10">
            <h1 className="text-3xl font-extrabold mb-6">سلة التسوق</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>المنتجات في السلة</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">المنتج</TableHead>
                                        <TableHead></TableHead>
                                        <TableHead>السعر</TableHead>
                                        <TableHead className="w-[120px]">الكمية</TableHead>
                                        <TableHead>الإجمالي</TableHead>
                                        <TableHead><span className="sr-only">إزالة</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cartItems.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Image 
                                                    src={item.image_url || `https://placehold.co/100x100.png`} 
                                                    alt={item.name} 
                                                    width={80} 
                                                    height={80} 
                                                    className="rounded-md object-cover"
                                                    data-ai-hint="fashion clothing"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>{Number(item.price).toFixed(2)} ج.م</TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    min="1" 
                                                    value={item.quantity} 
                                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                                    className="w-20 text-center"
                                                />
                                            </TableCell>
                                            <TableCell>{(Number(item.price) * item.quantity).toFixed(2)} ج.م</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>ملخص الطلب</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span>المجموع الفرعي</span>
                                <span>{total.toFixed(2)} ج.م</span>
                            </div>
                             <div className="flex justify-between font-bold text-lg">
                                <span>الإجمالي النهائي</span>
                                <span>{total.toFixed(2)} ج.م</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-2">
                             <Button asChild size="lg" className="w-full">
                                <Link href="/checkout">
                                    إتمام الطلب
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full" onClick={clearCart}>
                                إفراغ السلة
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
