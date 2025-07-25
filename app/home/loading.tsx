import React from 'react';
import TestCardsSkeleton from '@/components/home/TestCardsSkeleton';

export default function Loading() {
  return (
    <div className='w-full h-auto flex flex-col gap-4 pb-5 animate-pulse'>
      <header className='h-auto flex flex-col gap-4'>
        <div className='h-8 w-1/3 bg-gray-200 rounded mb-2' />
        <div className='flex gap-2 p-3 px-5 text-[16px] rounded-xl bg-gray-200 shadow-md'>
          <div className='h-6 w-6 bg-gray-300 rounded-full' />
          <div className='h-6 w-1/2 bg-gray-200 rounded' />
        </div>
        <div className='flex gap-4'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='h-8 w-24 bg-gray-100 rounded shadow-sm' />
          ))}
        </div>
        <div>
          <div className='h-8 w-1/4 bg-gray-200 rounded mb-4' />
          <div className='w-full flex flex-wrap gap-4'>
            {[...Array(3)].map((_, i) => (
              <TestCardsSkeleton key={i} variant="big" />
            ))}
          </div>
        </div>
      </header>
    </div>
  );
} 