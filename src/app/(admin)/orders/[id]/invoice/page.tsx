
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { useParams } from "next/navigation";

const InvoicePage = () => {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) fetchInvoice();
  }, [orderId]);

  useEffect(() => {
    // Automatically trigger print when data is loaded
    if (!loading && order && customer) {
      window.print();
    }
  }, [loading, order, customer]);

  const fetchInvoice = async () => {
    setLoading(true);
    // 1. Fetch order
    const { data: orderData } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (!orderData) {
        setLoading(false);
        return;
    }
    setOrder(orderData);

    // 2. Fetch customer and items in parallel
    const [customerRes, itemsRes] = await Promise.all([
        supabase
        .from("customers")
        .select("*")
        .eq("id", orderData.customer_id)
        .single(),
        supabase
        .from("order_items")
        .select("*, product:products(name, price)")
        .eq("order_id", orderId)
    ]);
    
    setCustomer(customerRes.data);
    setOrderItems(itemsRes.data || []);
    setLoading(false);
  };

  const calculateTotal = () => {
    if (!orderItems || orderItems.length === 0) return 0;
    return orderItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
  };

  if (loading) return <div className="flex items-center justify-center h-screen">جاري تحميل الفاتورة...</div>;
  if (!order || !customer) return <div className="flex items-center justify-center h-screen">لم يتم العثور على بيانات الفاتورة.</div>;

  return (
    <div className="p-8 bg-white text-black font-[Cairo] max-w-3xl mx-auto my-8 shadow-lg rounded-lg print:shadow-none print:m-0 print:p-0">
      <h1 className="text-2xl font-bold text-center mb-6">
        شركة Diamond Fashion
      </h1>

      <div className="flex justify-between mb-4">
        <p>فاتورة مبيعات رقم: {order.order_number}</p>
        <p>التاريخ: {new Date(order.created_at).toLocaleDateString("ar-EG")}</p>
      </div>

      <div className="border p-4 mb-4 rounded-lg">
        <h2 className="font-bold mb-2">بيانات العميل:</h2>
        <p>الاسم: {customer.name}</p>
        <p>رقم الهاتف: {customer.phone}</p>
      </div>

      <table className="w-full border-collapse mb-4">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2 text-right">المنتج</th>
            <th className="border p-2">الكمية</th>
            <th className="border p-2">السعر</th>
            <th className="border p-2">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {orderItems.map((item, index) => (
            <tr key={index}>
              <td className="border p-2">{item.product?.name ?? 'منتج محذوف'}</td>
              <td className="border p-2 text-center">{item.quantity}</td>
              <td className="border p-2 text-center">
                {Number(item.price).toFixed(2)} ج.م
              </td>
              <td className="border p-2 text-center">
                {(item.quantity * item.price).toFixed(2)} ج.م
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right mb-4">
        <p className="font-bold text-lg">
          الإجمالي الكلي: {calculateTotal().toFixed(2)} ج.م
        </p>
      </div>

      <div className="mt-4">
        <p><span className="font-bold">حالة الطلب:</span> {order.status}</p>
      </div>

      <div className="flex gap-4 mt-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
        >
          طباعة الفاتورة
        </button>
      </div>
    </div>
  );
};

export default InvoicePage;
