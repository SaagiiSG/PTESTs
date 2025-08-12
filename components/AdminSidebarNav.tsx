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
    <nav className="flex flex-col gap-4">
      {/* Collapse Toggle Button */}
      <div className="flex justify-end mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Simple Admin Header */}
      <div className="mb-4 p-3 border-b">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          {!isCollapsed && <h3 className="font-medium text-sm">Admin</h3>}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="space-y-1">
        {navItems.map(({ name, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Button
              key={name}
              asChild
              variant={active ? "default" : "ghost"}
              className={`w-full justify-start h-10 px-3 ${isCollapsed ? 'px-2' : 'px-3'}`}
              title={isCollapsed ? t(name) : undefined}
            >
              <Link href={href} className="flex items-center gap-3 w-full">
                <Icon className="w-4 h-4" />
                {!isCollapsed && <span className="text-sm">{t(name)}</span>}
              </Link>
            </Button>
          );
        })}
      </div>
      
      {/* Theme and Language Controls */}
      <div className="space-y-2">
        {!isCollapsed && <LangToggle variant="compact" className="w-full h-8" />}
      </div>
    </nav>
  );
} 