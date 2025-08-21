
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  DollarSign,
  LayoutDashboard,
  MessageCircle,
  Package,
  Receipt,
  ShoppingCart,
  Users,
  Undo2,
} from 'lucide-react';
import { useSidebar } from "@/components/ui/sidebar";


const links = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/orders", label: "الطلبات", icon: ShoppingCart },
  { href: "/customers", label: "العملاء", icon: Users },
  { href: "/products", label: "المنتجات", icon: Package },
  { href: "/returns", label: "المرتجعات", icon: Undo2 },
  { href: "/expenses", label: "المصروفات", icon: DollarSign },
  { href: "/whatsapp", label: "رسائل واتساب", icon: MessageCircle },
];


export function Nav() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar();

  return (
    <nav className="grid items-start p-3 space-y-1 text-sm font-medium">
        {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpenMobile(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 transition-all hover:bg-primary/10 text-gray-700",
                { "bg-primary/10 text-primary font-bold": isActive }
              )}
            >
              <span className={cn(
                  "p-2 rounded-lg bg-primary/15 text-primary transition-all",
                  { "bg-primary text-white scale-110 shadow-lg": isActive }
              )}>
                <link.icon className="h-5 w-5" />
              </span>
              <span className="font-medium text-base">{link.label}</span>
            </Link>
          )
        })}
    </nav>
  )
}

export default Nav;
