
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // This effect should only run on the client side
    if (typeof window === 'undefined') {
      return;
    }

    const auth = localStorage.getItem("auth");
    
    // Allow access to login page regardless of auth state
    if (pathname.startsWith("/login")) {
      setIsChecking(false);
      return;
    }
    
    // If not authenticated, redirect to login
    if (auth !== "true") {
      router.replace("/login");
    } else {
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
