"use client";
import React from 'react';
import TestsListWithSearch from '@/components/TestsListWithSearch';
import Navbar from '@/components/navbar';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import LangToggle from '@/components/LangToggle';
import { useLanguage } from '@/lib/language';

export default function TestsPage() {
  const { t } = useLanguage();

  return (
    <div>
      <main className="min-h-screen py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('tests')}</h1>
        </div>
        <Breadcrumbs />
        <TestsListWithSearch />
      </main>
    </div>
  );
} 