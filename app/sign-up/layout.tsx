"use client";

import { Toaster } from "sonner";
import BG from "@/public/bg-reg.jpg"
import logo from "@/public/ppnim_logo.svg"
import Image from "next/image";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <div className="w-full h-auto flex flex-col justify-start items-center bg-gray-50">
          
         {children}
        <Toaster richColors position="top-center" />
        </div>
    </html>

   
  );
}