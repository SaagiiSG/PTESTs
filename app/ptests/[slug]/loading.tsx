import React from 'react';

export default function Loading() {
  return (
    <div className="w-full flex justify-center items-center min-h-screen bg-gray-50 animate-pulse">
      <div className="w-96 h-64 bg-gray-200 rounded-xl shadow mr-8" />
      <div className="max-w-xl p-8 bg-white rounded-xl shadow ml-8 flex flex-col gap-4">
        <div className="h-6 w-1/2 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-full bg-gray-100 rounded mb-2" />
        <div className="h-4 w-2/3 bg-gray-100 rounded mb-4" />
        <div className="h-10 w-32 bg-blue-200 rounded" />
      </div>
    </div>
  );
} 