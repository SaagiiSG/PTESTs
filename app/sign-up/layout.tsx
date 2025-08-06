"use client";

import { Toaster } from "sonner";
import BG from "@/public/bg-reg.jpg"
import logo from "@/public/ppnim_logo.svg"
import Image from "next/image";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <div className="w-full flex flex-col justify-start items-center h-full py-4">
    
          <section className="flex flex-col items-center gap-8">
            <div className="relative flex justify-center items-center w-full rounded-3xl">
              <Image 
                src={BG}
                alt="Background Image"
                className="rounded-3xl"
              />
              <Image
                src={logo}
                alt="PPNIM Logo"
                className="absolute rounded-3xl"
              />
            </div>
       
          </section>
    
         {children}
        <Toaster richColors position="top-center" />
        </div>
    </html>

   
  );
}