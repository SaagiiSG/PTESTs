"use client";

import { Toaster } from "sonner";
import BG from "@/public/bg-reg.jpg"
import logo from "@/public/ppnim_logo.svg"
import Image from "next/image";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <div className="w-full flex flex-col justify-center items-center h-screen">
         {children}
        <Toaster richColors position="top-center" />
        </div>
    </html>

   
  );
}