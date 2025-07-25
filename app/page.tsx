import React from 'react';

export default function Loading() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50 animate-pulse">
      <div className="h-12 w-1/3 bg-gray-200 rounded mb-6" />
      <div className="h-6 w-1/2 bg-gray-100 rounded mb-2" />
      <div className="h-6 w-1/2 bg-gray-100 rounded mb-2" />
      <div className="h-10 w-32 bg-blue-200 rounded mt-4" />
    </div>
  );
}
