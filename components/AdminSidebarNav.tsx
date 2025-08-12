"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  AppWindow, 
  BookOpen, 
  GraduationCap, 
  Users, 
  BarChart3, 
  Settings, 
  CreditCard,
  Shield,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import LangToggle from "./LangToggle";
import { useLanguage } from "@/lib/language";
import { useTheme } from "next-themes";
import { useState } from "react";

type TranslationKey = "home" | "dashboard" | "users" | "courses" | "tests" | "analytics" | "settings";

const navItems: Array<{ 
  name: TranslationKey; 
  href: string; 
  icon: any; 
  category: string;
}> = [
  { 
    name: "dashboard", 
    href: "/admin", 
    icon: AppWindow, 
    category: "main"
  },
  { 
    name: "users", 
    href: "/admin/users", 
    icon: Users, 
    category: "management"
  },
  { 
    name: "courses", 
    href: "/admin/courses", 
    icon: GraduationCap, 
    category: "management"
  },
  { 
    name: "tests", 
    href: "/admin/tests", 
    icon: BookOpen, 
    category: "management"
  },
  { 
    name: "analytics", 
    href: "/admin/analytics", 
    icon: BarChart3, 
    category: "insights"
  },
  { 
    name: "settings", 
    href: "/admin/settings", 
    icon: Settings, 
    category: "system"
  },
];

interface AdminSidebarNavProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function AdminSidebarNav({ isCollapsed, onToggle }: AdminSidebarNavProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="flex flex-col h-full w-full">
      {/* Navigation Items */}
      <div className="space-y-3 flex-1 w-full">
        {navItems.map(({ name, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Button
              key={name}
              asChild
              variant={active ? "default" : "ghost"}
              className={`w-full justify-start h-14 ${isCollapsed ? 'px-3 mx-auto w-16' : 'px-4'}`}
              title={isCollapsed ? t(name) : undefined}
            >
              <Link href={href} className="flex items-center gap-3 w-full">
                <Icon className={`${isCollapsed ? 'w-12 h-12' : 'w-8 h-8'}`} />
                {!isCollapsed && <span className="text-sm">{t(name)}</span>}
              </Link>
            </Button>
          );
        })}
      </div>
      
      {/* Theme and Language Controls */}
      <div className="space-y-2 mt-auto w-full">
      <LangToggle variant="compact" className="w-full h-8" />
      </div>
    </nav>
  );
} 