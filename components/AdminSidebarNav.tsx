"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, AppWindow, BookOpen, GraduationCap, Users, BarChart3, Settings } from "lucide-react";
import LangToggle from "./LangToggle";
import { useLanguage } from "@/lib/language";

type TranslationKey = "home" | "dashboard" | "users" | "courses" | "tests" | "analytics" | "settings";

const navItems: Array<{ name: TranslationKey; href: string; icon: any }> = [
  
  { name: "dashboard", href: "/admin", icon: AppWindow },
  { name: "users", href: "/admin/users", icon: Users },
  { name: "courses", href: "/admin/courses", icon: GraduationCap },
  { name: "tests", href: "/admin/tests", icon: BookOpen },
  { name: "analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "settings", href: "/admin/settings", icon: Settings },
  { name: "home", href: "/home", icon: Home },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="flex flex-col gap-3">
      {navItems.map(({ name, href, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Button
            asChild
            key={name}
            variant={isActive ? "default" : "ghost"}
            className="w-full h-auto rounded-2xl justify-start text-md py-2 gap-3"
          >
            <Link href={href} className="flex items-center gap-3">
              <Icon className="w-5 h-5" /> {t(name)}
            </Link>
          </Button>
        );
      })}
      
      {/* Language Toggle */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <LangToggle variant="default" className="w-full" />
      </div>
    </nav>
  );
} 