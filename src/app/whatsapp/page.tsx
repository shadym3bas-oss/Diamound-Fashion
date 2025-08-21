
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";

const statusKeys = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const statusTranslations: { [key: string]: string } = {
  pending: "🕒 قيد الانتظار",
  confirmed: "✅ مؤكد",
  shipped: "🚚 تم الشحن",
  delivered: "📦 تم التسليم",
  cancelled: "❌ ملغي",
};

export default function WhatsappTemplatesPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<{ [key: string]: string }>({
    pending: "مرحبًا {customer_name}،\nتم استلام طلبك رقم #{order_number} وهو الآن في حالة انتظار المراجعة.\nسيقوم فريقنا بالتواصل معك قريبًا لتأكيد الطلب والبدء في تجهيزه.",
    confirmed: "شكرًا لك {customer_name}،\nنود إعلامك بأنه قد تم تأكيد طلبك رقم #{order_number} وجارٍ العمل على تجهيزه بعناية ليصلك في أقرب وقت.",
    shipped: "أهلاً {customer_name}،\nيسعدنا إخبارك أن طلبك رقم #{order_number} قد تم شحنه بالفعل وهو الآن في الطريق إليك.\nيمكنك تتبع حالة الطلب من خلال فريق خدمة العملاء لدينا.",
    delivered: "عزيزي {customer_name}،\nنشكرك على ثقتك بنا ❤️\nنود إعلامك أن طلبك رقم #{order_number} قد تم تسليمه بنجاح.\nنتمنى أن تكون تجربتك معنا مميزة، ويسعدنا خدمتك دائمًا.",
    cancelled: "مرحبًا {customer_name}،\nنأسف لإبلاغك أنه قد تم إلغاء طلبك رقم #{order_number} بناءً على طلبك أو لظروف خارجة عن إرادتنا.\nيسعدنا مساعدتك في إنشاء طلب جديد في أي وقت.",
  });

  const handleSave = async () => {
    setIsLoading(true);
    // In a real app, you would save this to a database or a settings file.
    // For this example, we'll just simulate a save.
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // You can use localStorage to persist changes in the browser
    localStorage.setItem('whatsapp_templates', JSON.stringify(templates));

    setIsLoading(false);
    toast({
      title: "نجاح!",
      description: "تم حفظ قوالب الرسائل بنجاح.",
    });
  };

  // On component mount, load templates from localStorage if they exist
  useState(() => {
    const savedTemplates = localStorage.getItem('whatsapp_templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  });


  const handleTemplateChange = (status: string, value: string) => {
    setTemplates(prev => ({ ...prev, [status]: value }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">قوالب رسائل واتساب</h1>
          <p className="text-muted-foreground mt-2">
            قم بتخصيص الرسائل التي يتم إرسالها للعملاء عند تغيير حالة الطلب.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>تعديل القوالب</CardTitle>
            <CardDescription>
              يمكنك استخدام متغيرات مثل `#{'order_number'}` و `{'{customer_name}'}` ليتم استبدالها تلقائيًا بقيم الطلب.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {statusKeys.map(status => (
              <div key={status} className="space-y-2">
                <Label htmlFor={`template-${status}`} className="text-lg font-medium">
                  {statusTranslations[status]}
                </Label>
                <Textarea
                  id={`template-${status}`}
                  value={templates[status]}
                  onChange={(e) => handleTemplateChange(status, e.target.value)}
                  rows={4}
                  className="bg-muted/40"
                />
              </div>
            ))}
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
