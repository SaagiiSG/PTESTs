"use client";

import Image from "next/image";
import { Toaster } from "sonner";
import BG from "@/public/bg-reg.jpg";
import logo from "@/public/ppnim_logo.svg";

export default function ProfileSetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex flex-col justify-center items-center min-h-screen">
      {children}
      <Toaster richColors position="top-center" />
    </div>
  );
}