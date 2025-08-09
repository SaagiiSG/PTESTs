"use client";

import { Toaster } from "sonner";
import BG from "@/public/bg-reg.jpg"
import logo from "@/public/ppnim_logo.svg"
import Image from "next/image";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <section className="w-full h-screen flex flex-col justify-center items-center bg-gray-50">
        <section className=" flex flex-col items-center gap-6 sm:gap-8 w-full md:w-1/2">
          <div className="relative flex justify-center items-center w-full">
            <Image 
              src={BG}
              alt="Background Image"
              className="w-full h-48  md:rounded-3xl md:h-auto"
              priority
            />
            <Image
              src={logo}
              alt="PPNIM Logo"
              className="absolute w-24 h-24 sm:w-32 sm:h-32"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Welcome to PTEST</h1>
        </section>

        {children}
        <Toaster richColors position="top-center" />
      </section>
    </html>
  );
}