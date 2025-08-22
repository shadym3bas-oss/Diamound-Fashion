
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateOrderStatus } from "../actions";
import { Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

type Order = {
    id: string;
    status: string;
}

export function OrderStatusActions({ order }: { order: Order }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const availableActions = (status: string): string[] => {
        switch (status) {
            case 'pending': return ['confirmed', 'cancelled'];
            case 'confirmed': return ['shipped', 'cancelled'];
            case 'shipped': return ['delivered'];
            default: return [];
        }
    }

    const statusTranslations: { [key: string]: string } = {
        'confirmed': 'تأكيد الطلب',
        'shipped': 'تم الشحن',
        'delivered': 'تم التسليم',
        'cancelled': 'إلغاء الطلب'
    };

    const statusVariants: { [key: string]: "default" | "destructive" | "outline" } = {
        'confirmed': 'default',
        'shipped': 'default',
        'delivered': 'default',
        'cancelled': 'destructive'
    }

    const handleUpdateStatus = async (newStatus: string) => {
        setIsLoading(true);
        const result = await updateOrderStatus({ id: order.id, status: newStatus as any });
        if (result.error) {
            toast({
                variant: "destructive",
                title: "حدث خطأ",
                description: result.error,
            });
        } else {
            toast({
                title: "نجاح!",
                description: "تم تحديث حالة الطلب بنجاح.",
            });
            router.refresh(); // Refresh the page to show new status and actions
        }
        setIsLoading(false);
    }
    
    const actions = availableActions(order.status);

    if (actions.length === 0) {
        return <p className="text-muted-foreground">لا توجد إجراءات متاحة لهذه الحالة.</p>;
    }

    return (
        <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            
            {!isLoading && actions.map(action => (
                 <AlertDialog key={action}>
                    <AlertDialogTrigger asChild>
                        <Button variant={statusVariants[action] || 'outline'} disabled={isLoading}>
                            {statusTranslations[action]}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                            <AlertDialogDescription>
                                هل تريد حقًا تحديث حالة هذا الطلب إلى "{statusTranslations[action]}"؟
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleUpdateStatus(action)}>
                                نعم، قم بالتحديث
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            ))}
        </div>
    )
}
