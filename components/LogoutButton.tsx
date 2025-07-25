"use client";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
export default function LogoutButton() {
  return (
    <Button
      variant="ghost"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="px-4 py-4 h-10 rounded-lg mt-4 text-md border-red-600 bg-red-200/80 border-[1px] hover:bg-red-200/100"
    >
      <LogOut />
      Log out
    </Button>
  );
} 