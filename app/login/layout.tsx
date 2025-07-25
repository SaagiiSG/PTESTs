"use client";

import { Toaster } from "sonner";
import BG from "@/public/bg-reg.jpg"
import logo from "@/public/ppnim_logo.svg"
import Image from "next/image";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <section className="w-full h-screen flex flex-col justify-center items-center">
    
          <section className="flex flex-col items-center gap-8">
            <div className="relative flex justify-center items-center w-full">
              <Image 
                src={BG}
                alt="Background Image"
              />
              <Image
                src={logo}
                alt="PPNIM Logo"
                className="absolute"
              />
            </div>
            <h1 className="text-2xl font-semibold">Welcome to PTEST</h1>
          </section>
    
         {children}
        <Toaster richColors position="top-center" />
        </section>
    </html>

   
  );
}