
"use client";
import { useForm } from "react-hook-form";
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
import { useToast } from "@/hooks/use-toast";
import { addProduct } from "../actions";

const formSchema = z.object({
  name: z.string().min(2, "اسم المنتج مطلوب"),
  price: z.coerce.number().min(0, "السعر لا يمكن أن يكون سالبًا"),
  stock: z.coerce.number().min(0, "المخزون لا يمكن أن يكون سالبًا").default(0),
});

export function ProductForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      stock: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await addProduct(values);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: result.error,
      });
    } else {
      toast({
        title: "نجاح!",
        description: "تمت إضافة المنتج بنجاح.",
      });
      form.reset();
       if (onSuccess) {
        onSuccess();
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المنتج</FormLabel>
              <FormControl>
                <Input placeholder="مثال: فستان سهرة" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>السعر</FormLabel>
                    <FormControl>
                    <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>الكمية المتاحة</FormLabel>
                    <FormControl>
                    <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "جاري الإضافة..." : "إضافة منتج"}
        </Button>
      </form>
    </Form>
  );
}
