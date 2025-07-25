import React from 'react';

export default function TestCardsSkeleton({ variant }: { variant: 'big' | 'small' }) {
  return (
    <div className={`${variant === 'big' ? 'w-[33%]' : 'w-full'} animate-pulse`}>
      <div
        className={`cursor-pointer rounded-lg h-auto flex flex-col gap-2 ${
          variant === 'big' ? 'max-w-2xl' : 'w-full flex flex-row items-start justify-start'
        }`}
      >
        <div
          className={`relative w-content h-full bg-gray-200 rounded-lg ${
            variant === 'big' ? 'h-64' : 'aspect-square h-24 w-24'
          }`}
        />
        <div className={`p-4 ${variant === 'big' ? 'text-left' : 'text-left'}`}>
          <div className={`font-bold ${variant === 'big' ? 'text-lg' : 'text-md'} h-6 w-1/2 bg-gray-200 rounded mb-2`} />
          <div className={`mt-2 ${variant === 'big' ? 'text-base' : 'text-sm'} h-4 w-full bg-gray-100 rounded`} />
        </div>
      </div>
    </div>
  );
} 