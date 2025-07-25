"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, AppWindow, BookOpen, GraduationCap } from "lucide-react";

const navItems = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Dashboard", href: "/admin", icon: AppWindow },
  { name: "Create Test", href: "/admin/create-test", icon: BookOpen },
  { name: "Create Course", href: "/admin/create-course", icon: GraduationCap },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();
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
              <Icon className="w-5 h-5" /> {name}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
} 