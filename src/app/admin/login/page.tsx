"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Gem, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate a network request
        setTimeout(() => {
            if (password === process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD) {
                localStorage.setItem("auth", "true");
                toast({
                    title: "تم تسجيل الدخول بنجاح!",
                    description: "جاري توجيهك إلى لوحة التحكم.",
                });
                router.push("/admin/dashboard");
            } else {
                toast({
                    variant: "destructive",
                    title: "خطأ في تسجيل الدخول",
                    description: "كلمة المرور التي أدخلتها غير صحيحة.",
                });
                setIsLoading(false);
            }
        }, 500);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-sm">
                <form onSubmit={handleLogin}>
                    <CardHeader className="text-center">
                         <div className="mx-auto bg-primary/10 p-4 rounded-full mb-3 w-fit">
                            <Gem className="h-10 w-10 text-primary"/>
                        </div>
                        <CardTitle className="text-2xl">Diamond Fashion</CardTitle>
                        <CardDescription>
                            الرجاء إدخال كلمة المرور للوصول إلى لوحة التحكم.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="********"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isLoading ? "جاري التحقق..." : "تسجيل الدخول"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
