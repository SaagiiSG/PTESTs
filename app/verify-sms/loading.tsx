import React from 'react';

export default function Loading() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50 animate-pulse">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-8 flex flex-col gap-4">
        <div className="h-8 w-1/2 bg-gray-200 rounded mb-4 mx-auto" />
        <div className="h-10 w-full bg-gray-100 rounded mb-2" />
        <div className="h-10 w-full bg-gray-100 rounded mb-2" />
        <div className="h-10 w-32 bg-blue-200 rounded mx-auto mt-4" />
      </div>
    </div>
  );
} 