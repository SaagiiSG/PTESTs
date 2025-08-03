"use client";
import React, { useEffect, useState } from 'react';

export default function TestSimplePage() {
  const [message, setMessage] = useState('Initial message');

  useEffect(() => {
    console.log('TestSimplePage mounted!');
    setMessage('Component mounted successfully!');
  }, []);

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Test Simple Page</h1>
        <p className="text-gray-600 mb-4">{message}</p>
        <button 
          onClick={() => setMessage('Button clicked!')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Click me
        </button>
      </div>
    </div>
  );
} 