"use client";
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from './ui/button'
import logo from "@/public/PPNIM-logo-colered.svg" 
import { Home, BookOpen, GraduationCap, User } from 'lucide-react';
import LangToggle from './LangToggle';
import LogoutButton from './LogoutButton';
import { ThemeToggle } from './ThemeToggle';
import { useLanguage } from '@/lib/language';

const navbar = () => {
  const { t } = useLanguage();
  const pathname = usePathname();

  const navItems = [
    { href: "/home", icon: Home, label: t('home') },
    { href: "/Tests", icon: BookOpen, label: t('tests') },
    { href: "/Course", icon: GraduationCap, label: t('courses') },
    { href: "/profile", icon: User, label: t('profile') },
  ];

  const isActive = (href: string) => {
    if (href === "/home") {
      return pathname === "/home" || pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className='fixed bottom-0 left-0 w-full h-20 z-50 bg-background/95 backdrop-blur-[6px] flex justify-between items-center py-1 px-1 border-t border-border shadow-sm sm:sticky sm:top-0 sm:bottom-auto sm:py-3 sm:px-6 sm:rounded-3xl sm:border-t-0 sm:border-b sm:shadow-md transition-all duration-300'>
      <Link href={"/home"} className="hidden sm:block group">
        <Image
          src={logo}
          alt="PPNIM Logo"
          width={80}
          height={40}
          className="cursor-pointer transition-transform duration-300 group-hover:scale-105"
        /> 
      </Link>
      <div className='flex gap-1 w-full justify-evenly sm:justify-end'>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Button 
              key={item.href}
              asChild 
              variant={'ghost'} 
              className={`h-20 flex-1 sm:h-full sm:flex-initial p-1 sm:p-2 navbar-item ${
                active ? 'active' : ''
              }`}
            >
              <Link href={item.href}>
                <div className='h-full flex flex-col items-center justify-center gap-0.5 text-md relative'>
                  <span className={`text-5xl sm:text-2xl flex items-center justify-center transition-all duration-300 ${
                    active ? 'text-blue-600 scale-110' : 'text-muted-foreground hover:text-blue-500'
                  }`}>
                    <Icon className="w-14 h-14 sm:w-6 sm:h-6" />
                  </span>
                  <span className="hidden sm:inline text-xs font-medium transition-colors duration-300">
                    {item.label}
                  </span>
                  
                  {/* Active indicator for mobile */}
                  {active && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full sm:hidden" />
                  )}
                </div>
              </Link>
            </Button>
          );
        })}
        
        {/* Right side - User actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LangToggle variant="compact" className="hidden sm:block" />
        </div>
      </div>
    </div>
  )
}

export default navbar
