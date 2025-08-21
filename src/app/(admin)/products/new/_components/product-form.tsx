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
import { useToast } from "@/hooks/use-toast";
import { addProduct } from "../actions";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  name: z.string().min(2, "اسم المنتج مطلوب"),
  description: z.string().optional(),
  image_urls: z.array(z.object({ value: z.string().url("يجب أن يكون رابطًا صالحًا") })).min(1, "يجب إضافة رابط صورة واحد على الأقل"),
  colors: z.string().optional(), // Comma-separated string
  price: z.coerce.number().min(0, "السعر لا يمكن أن يكون سالبًا"),
  stock: z.coerce.number().min(0, "المخزون لا يمكن أن يكون سالبًا").default(0),
});

export function ProductForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      image_urls: [{ value: "" }],
      colors: "",
      price: 0,
      stock: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "image_urls",
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
         <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الوصف</FormLabel>
              <FormControl>
                <Textarea placeholder="وصف تفصيلي للمنتج..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <Label>روابط الصور</Label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2 mt-2">
              <FormField
                control={form.control}
                name={`image_urls.${index}.value`}
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input placeholder={`https://example.com/image-${index + 1}.png`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
           <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            إضافة صورة أخرى
          </Button>
        </div>

        <FormField
          control={form.control}
          name="colors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الألوان المتاحة</FormLabel>
              <FormControl>
                <Input placeholder="أحمر, أزرق, أسود" {...field} />
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
