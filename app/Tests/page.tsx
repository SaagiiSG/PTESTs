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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('tests')}</h1>
            <p className="text-gray-600 mt-1">Discover and take various types of tests</p>
          </div>
        </div>
        <Breadcrumbs />
        <TestsListWithSearch />
      </main>
    </div>
  );
} 