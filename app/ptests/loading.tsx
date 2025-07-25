import React from 'react';
import TestCardsSkeleton from '@/components/home/TestCardsSkeleton';

export default function Loading() {
  return (
    <div className='w-full flex flex-wrap gap-4 p-8 animate-pulse'>
      {[...Array(3)].map((_, i) => (
        <TestCardsSkeleton key={i} variant="big" />
      ))}
    </div>
  );
} 