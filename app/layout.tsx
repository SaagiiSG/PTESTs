import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/language";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Footer from "@/components/footer";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PTest App",
  description: "A hybrid purchase and test platform.",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PTest App",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "256x256", type: "image/x-icon" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/icon-192x192.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.youtube.com https://player.vimeo.com https://psychometricsmongolia-my.sharepoint.com https://take.quiz-maker.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.poll-maker.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; media-src 'self' https: blob:; frame-src 'self' https://www.youtube.com https://player.vimeo.com https://psychometricsmongolia-my.sharepoint.com https://take.quiz-maker.com; connect-src 'self' https:; worker-src 'self' blob:;"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Move favicon links to head
              document.addEventListener('DOMContentLoaded', function() {
                document.querySelectorAll('body link[rel="icon"], body link[rel="apple-touch-icon"]').forEach(el => {
                  if (el.parentNode === document.body) {
                    document.head.appendChild(el);
                  }
                });
              });
              
              // Prevent external script errors
              window.addEventListener('error', function(e) {
                if (e.filename && (e.filename.includes('sharebx.js') || e.filename.includes('css.js'))) {
                  e.preventDefault();
                  console.warn('External script blocked:', e.filename);
                }
              });
              
              // Handle blob script loading
              window.addEventListener('message', function(e) {
                if (e.data && e.data.type === 'blob-script') {
                  console.log('Blob script message received:', e.data);
                }
              });
            `,
          }}
        />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <ErrorBoundary>
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <LanguageProvider>
                <div className="flex flex-col min-h-screen">
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                </div>
                <Toaster richColors position="top-center" />
              </LanguageProvider>
            </ThemeProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
