"use client";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const handleLogout = async () => {
    // Clear all browser storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Sign out from NextAuth
    await signOut({ 
      callbackUrl: "/",
      redirect: true 
    });
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className="px-4 py-4 h-10 rounded-lg mt-4 text-md border-red-600 bg-red-200/80 border-[1px] hover:bg-red-200/100"
    >
      <span className="flex flex-row items-center justify-center gap-2">
        <LogOut />
        <span>Log out</span>
      </span>
    </Button>
  );
} 