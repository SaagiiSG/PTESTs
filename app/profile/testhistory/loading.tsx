import React from 'react';

export default function Loading() {
  return (
    <div className='w-full flex flex-col gap-4 p-8 animate-pulse'>
      {[...Array(3)].map((_, i) => (
        <div key={i} className='h-16 w-full bg-gray-200 rounded mb-2' />
      ))}
    </div>
  );
} 