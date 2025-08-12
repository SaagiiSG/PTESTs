'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Globe,
  Heart,
  ExternalLink,
  Settings,
  Shield,
  BarChart3
} from 'lucide-react';
import { useLanguage } from '@/lib/language';
import { usePathname } from 'next/navigation';
import logo from "@/public/PPNIM-logo-colered.svg";

interface FooterProps {
  variant?: 'default' | 'admin' | 'minimal';
}

const Footer = ({ variant = 'default' }: FooterProps) => {
  const { t } = useLanguage();
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const isAdminPage = pathname?.startsWith('/admin');

  // Auto-detect admin pages if variant is not explicitly set
  if (variant === 'default' && isAdminPage) {
    variant = 'admin';
  }

  const navigationLinks = [
    { href: "/home", icon: Home, label: t('home') },
    { href: "/Tests", icon: BookOpen, label: t('tests') },
    { href: "/Course", icon: GraduationCap, label: t('courses') },
    { href: "/profile", icon: User, label: t('profile') },
  ];

  const adminLinks = [
    { href: "/admin", icon: BarChart3, label: "Dashboard" },
    { href: "/admin/users", icon: User, label: "Users" },
    { href: "/admin/courses", icon: GraduationCap, label: "Courses" },
    { href: "/admin/tests", icon: BookOpen, label: "Tests" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  const quickLinks = [
    
    { href: "https://psychometrics.mn/mn/", label: "Home" },
    { href: "https://psychometrics.mn/", label: "About Us" },
    { href: "https://psychometrics.mn/mn/elements/psychometrics-catalogue/", label: "Psycometrics Tests" },
    { href: "https://psychometrics.mn/mn/news2/", label: "News" },
  ];

  const socialLinks = [
    { href: "https://www.facebook.com/psychometrics.mongolia", icon: Facebook, label: "Facebook" },
    { href: "https://psychometrics.mn/", icon: Globe, label: "Website" },
    // { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
    // { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
    // { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
  ];

  const contactInfo = [
    { icon: Mail, label: "info@psychometrics.mn", href: "info@psychometrics.mn" },
    { icon: Phone, label: "+976 75057188", href: "tel:+976 75057188" },
    { icon: MapPin, label: "Ulaanbaatar, Mongolia", href: "https://www.google.com/maps/place/Ikh+Mongol+Residence/@47.9054236,106.9420219,78m/data=!3m1!1e3!4m6!3m5!1s0x5d96922bce89510b:0x6d084460e28c8189!8m2!3d47.9053831!4d106.9421953!16s%2Fg%2F11cmxzcfyh?entry=ttu&g_ep=EgoyMDI1MDczMC4wIKXMDSoASAFQAw%3D%3D" },
  ];

  // Admin footer variant
  if (variant === 'admin') {
    return (
      <footer className="bg-background border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-6 pl-24">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="inline-block group">
                <Image
                  src={logo}
                  alt="TestCenter Logo"
                  width={100}
                  height={50}
                  className="cursor-pointer transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/home" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                Back to Home
              </Link>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">&copy; {currentYear} TestCenter Admin</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Minimal footer variant
  if (variant === 'minimal') {
    return (
      <footer className="bg-background border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <span>&copy; {currentYear} TestCenter. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-foreground transition-colors duration-200">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors duration-200">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Default footer variant
  return (
    <footer className="bg-background border-t border-border mt-auto">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/home" className="inline-block group">
              <Image
                src={logo}
                alt="TestCenter Logo"
                width={120}
                height={60}
                className="cursor-pointer transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta quis debitis eveniet voluptatibus ea quos error illum voluptatem? Officia, fugiat.
            </p>
            
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Quick Links</h3>
            <nav className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-1 transform"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Contact Us</h3>
            <div className="space-y-3">
              {contactInfo.map((contact) => {
                const Icon = contact.icon;
                return (
                  <Link
                    key={contact.label}
                    href={contact.href}
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group"
                  >
                    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>{contact.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Follow Us</h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-muted hover:bg-accent transition-colors duration-200 group"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                  </Link>
                );
              })}
            </div>
            
            {/* Newsletter Signup */}
            
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="mt-8 lg:hidden">
          <Separator className="my-6" />
          <div className="grid grid-cols-2 gap-4">
            {(isAdminPage ? adminLinks : navigationLinks).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-accent transition-colors duration-200 group"
                >
                  <Icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>&copy; {currentYear} TestCenter. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Version 1.0.0</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/privacy" 
                className="hover:text-foreground transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <span className="hidden sm:inline">•</span>
              <Link 
                href="/terms" 
                className="hover:text-foreground transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <span className="hidden sm:inline">•</span>
              <Link 
                href="/cookies" 
                className="hover:text-foreground transition-colors duration-200"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
