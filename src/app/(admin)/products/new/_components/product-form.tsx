
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
import { PlusCircle, Trash2, Upload, Link as LinkIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

const PREDEFINED_COLORS = [
  "Black", "White", "Red", "Blue", "Green", "Yellow", 
  "Purple", "Orange", "Pink", "Brown", "Gray", "Silver", "Gold"
];

const formSchema = z.object({
  name: z.string().min(2, "اسم المنتج مطلوب"),
  description: z.string().optional(),
  image_urls: z.array(z.object({ value: z.string().min(5, "يجب أن يكون رابطًا أو صورة صالحة") })).min(1, "يجب إضافة صورة واحدة على الأقل"),
  colors: z.array(z.string()).optional(),
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
      colors: [],
      price: 0,
      stock: 0,
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "image_urls",
  });

  const selectedColors = form.watch("colors") || [];
  const watchedImages = form.watch("image_urls");


  const handleColorToggle = (color: string) => {
    const currentColors = form.getValues("colors") || [];
    const newColors = currentColors.includes(color)
      ? currentColors.filter((c) => c !== color)
      : [...currentColors, color];
    form.setValue("colors", newColors, { shouldValidate: true });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        update(index, { value: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          <Label>صور المنتج</Label>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2 p-3 border rounded-lg">
                <Tabs defaultValue="url" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url"><LinkIcon className="ml-2" /> رابط صورة</TabsTrigger>
                    <TabsTrigger value="upload"><Upload className="ml-2" /> رفع صورة</TabsTrigger>
                  </TabsList>
                  <TabsContent value="url">
                    <FormField
                      control={form.control}
                      name={`image_urls.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder={`https://example.com/image.png`} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="upload">
                     <Input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, index)}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                  </TabsContent>
                </Tabs>
                {watchedImages[index]?.value && (
                  <div className="flex-shrink-0">
                    <Image src={watchedImages[index].value} alt="معاينة" width={64} height={64} className="rounded-md object-cover border" />
                  </div>
                )}
                 <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
              </div>
            ))}
          </div>
           <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            إضافة صورة أخرى
          </Button>
           {form.formState.errors.image_urls && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.image_urls.message}</p>}
        </div>

        <FormField
          control={form.control}
          name="colors"
          render={() => (
            <FormItem>
              <FormLabel>الألوان المتاحة</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-3 p-3 border rounded-lg bg-background">
                  {PREDEFINED_COLORS.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => handleColorToggle(color)}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                        selectedColors.includes(color)
                          ? "border-primary ring-2 ring-primary ring-offset-2"
                          : "border-gray-200"
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      <span className="sr-only">{color}</span>
                    </button>
                  ))}
                </div>
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
