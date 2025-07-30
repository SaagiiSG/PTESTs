import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from '@/components/ui/sonner';
import { LanguageProvider } from '@/lib/language';
import React from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'PTest App',
  description: 'A hybrid purchase and test platform.',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192x192.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        style={{
          background: "radial-gradient(ellipse 120% 80% at 50% 0%, #f0f4ff 0%, #f8fafd 60%, #fdf6ff 100%)",
        }}
      >
        <SessionProvider>
          <LanguageProvider>
            <Toaster richColors position="top-center" />
            {children}
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
