import Link from 'next/link';

export default function TestPublicPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">
          🎉 Public Page Working!
        </h1>
        <p className="text-gray-600 text-center mb-4">
          If you can see this page, basic access is working.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ Page loads: Working</p>
          <p>✅ Static assets: Working</p>
          <p>✅ Basic routing: Working</p>
        </div>
        <div className="mt-6 text-center">
          <Link 
            href="/"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 