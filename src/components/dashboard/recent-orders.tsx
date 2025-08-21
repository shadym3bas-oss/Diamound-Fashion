
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "../ui/button";

type Order = {
    id: string;
    order_number: string;
    status: string;
    customer: {
        name: string;
    },
    total: number;
    date: string;
}

export function RecentOrders({ orders }: { orders: Order[] }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline">قيد الانتظار</Badge>;
      case "confirmed": return <Badge className="bg-blue-500/10 text-blue-700">مؤكد</Badge>;
      case "shipped": return <Badge className="bg-indigo-500/10 text-indigo-700">تم الشحن</Badge>;
      case "delivered": return <Badge className="bg-emerald-500/10 text-emerald-700">تم التسليم</Badge>;
      case "cancelled": return <Badge variant="destructive">ملغي</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
            <CardTitle>آخر الطلبات</CardTitle>
            <CardDescription>قائمة بآخر 5 طلبات.</CardDescription>
        </div>
        <Button asChild size="sm" className="mr-auto gap-1">
            <Link href="/orders">
                عرض الكل
            </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العميل</TableHead>
              <TableHead className="hidden sm:table-cell">الحالة</TableHead>
              <TableHead className="text-left">المبلغ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
                <TableRow key={order.id}>
                    <TableCell>
                      <Link href={`/orders/${order.id}`} className="font-medium hover:underline text-primary">
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">#{order.order_number}</div>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-left">{order.total.toFixed(2)} ج.م</TableCell>
                </TableRow>
            ))}
             {orders.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    لا توجد طلبات حديثة.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
