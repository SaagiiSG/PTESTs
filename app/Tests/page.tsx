import React from 'react';
import TestsListWithSearch from '@/components/TestsListWithSearch';
import Navbar from '@/components/navbar';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function TestsPage() {
  return (
    <div>
      
      <main className="min-h-screen py-8">
    
        <h1 className="text-2xl font-bold text-center mb-6">All Tests</h1>
        <Breadcrumbs />
        <TestsListWithSearch />
      </main>
    </div>
  );
} 