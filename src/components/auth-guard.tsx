
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    
    // If not authenticated and not on login page, redirect to login
    if (auth !== "true" && pathname !== "/login") {
      router.replace("/login");
    } 
    // If authenticated and on login page, redirect to home
    else if (auth === "true" && pathname === "/login") {
      router.replace("/");
    } 
    // Otherwise, stop checking
    else {
      setIsChecking(false);
    }
  }, [pathname, router]);

  // While checking, show a loader
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // If not checking, render the children
  return <>{children}</>;
}
