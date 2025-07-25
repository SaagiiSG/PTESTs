"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import Navbar from "@/components/navbar";
import Image from "next/image";
import bg from "@/public/bg-profile (1).png";
import { Button } from '@/components/ui/button';
import { BookOpen, Book, UserCog, KeyRound, Shield, Info } from 'lucide-react';

type User = {
  name: string;
  email?: string;
  phoneNumber?: string;
  age?: number;
  gender?: string;
};

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [showSidebarMobile, setShowSidebarMobile] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api
      .get("/api/profile/me")
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => setUser(null));
  }, []);

  // On desktop, always show both columns
  // On mobile, show sidebar or main content based on showSidebarMobile
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

  // Navigation links with icons
  const navLinks = [
    { name: 'Test history', route: '/profile/testhistory', icon: <BookOpen className="w-4 h-4 mr-2" /> },
    { name: 'Course history', route: '/profile/coursehistory', icon: <Book className="w-4 h-4 mr-2" /> },
    { name: 'Edit profile', route: '/profile/editprofile', icon: <UserCog className="w-4 h-4 mr-2" /> },
    { name: 'Change password', route: '/profile/changepassword', icon: <KeyRound className="w-4 h-4 mr-2" /> },
    { name: 'Privacy', route: '/profile/privacy', icon: <Shield className="w-4 h-4 mr-2" /> },
    { name: 'About', route: '/profile/about', icon: <Info className="w-4 h-4 mr-2" /> },
  ];

  // Helper to handle navigation on mobile
  const handleNavMobile = (route: string) => {
    setShowSidebarMobile(false);
    router.push(route);
  };

  return (
    <div className="flex flex-col h-full items-center justify-center sm:pt-8">
      <section className="w-full sm:w-[87vw]">
        <Navbar />
        <div className="sm:mt-6 flex flex-col lg:flex-row">
          <div className={`w-full lg:w-1/2 rounded-none lg:rounded-l-3xl ${showSidebarMobile ? '' : 'hidden'} lg:block`}> 
            <Image
              src={bg}
              alt="Profile Background"
              className="w-full h-40 sm:h-64 object-cover lg:rounded-l-2xl lg:rounded-bl-none"
            />
            <aside className="h-full flex flex-col p-4 sm:p-8 bg-white border-r border-gray-200 rounded-b-md shadow min-h-[60vh]">
              {user ? (
                <div className="mb-8 flex flex-col items-center text-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {user.name}
                  </h2>
                  <p className="text-gray-600">
                    {user.email || user.phoneNumber}
                  </p>
                  {user.age && (
                    <p className="text-gray-600">Age: {user.age}</p>
                  )}
                  {user.gender && (
                    <p className="text-gray-600">Gender: {user.gender}</p>
                  )}
                </div>
              ) : (
                <p className="mb-8">Loading profile...</p>
              )}
              <nav className="flex flex-col items-start gap-4 w-full">
                {navLinks.map(link => (
                  <Button
                    asChild
                    key={link.name}
                    variant={pathname.includes(link.route.replace('/profile/', '')) ? 'default' : 'ghost'}
                    className="rounded-xl px-3 py-2 text-base flex items-center"
                    onClick={() => {
                      if (window.innerWidth < 1024) handleNavMobile(link.route);
                    }}
                  >
                    <Link href={link.route} className="flex items-center">
                      {link.icon}
                      {link.name}
                    </Link>
                  </Button>
                ))}
              </nav>
              {user && (
                <div className="mt-6">
                  <LogoutButton />
                </div>
              )}
            </aside>
          </div>

          {/* Main content area (right column) */}
          <main className={`min-h-screen flex flex-col w-full lg:w-1/2 ${showSidebarMobile && !isDesktop ? 'hidden' : ''}`}>
            <Image
              src={bg}
              alt="Profile Background"
              className="w-full h-40 sm:h-64 object-cover rounded-b-2xl lg:rounded-b-none lg:rounded-tr-2xl"
            />
            {/* Back button for mobile */}
            <div className="lg:hidden flex items-center p-2">
              <Button variant="ghost" onClick={() => setShowSidebarMobile(true)}>
                ← Back
              </Button>
            </div>
            {children}
          </main>
        </div>
      </section>
    </div>
  );
}