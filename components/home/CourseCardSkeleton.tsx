import React from 'react';

export default function CourseCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 bg-white shadow flex flex-col gap-2 animate-pulse">
      <div className="h-6 w-1/2 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-full bg-gray-100 rounded mb-2" />
      <div className="h-4 w-2/3 bg-gray-100 rounded mb-2" />
      <div className="h-4 w-1/4 bg-gray-200 rounded mb-2" />
      <div className="h-5 w-1/3 bg-blue-100 rounded" />
    </div>
  );
} 