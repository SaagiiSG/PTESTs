"use client";
import { useEffect, useState, use } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, LogIn, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TestEmbedPage({ params }: { params: Promise<{ testId: string }> }) {
  const resolvedParams = use(params);
  const [embedCode, setEmbedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  const [uniqueCode, setUniqueCode] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkAccessAndLoadEmbed = async () => {
      if (!session) {
        setIsLoading(false);
        return;
      }

      try {
        const accessRes = await fetch('/api/verify-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testId: resolvedParams.testId }),
        });

        if (accessRes.ok) {
          const accessData = await accessRes.json();
          setHasAccess(accessData.hasAccess);
          setUniqueCode(accessData.uniqueCode);

          if (accessData.hasAccess) {
            const embedRes = await fetch(`/api/protected-tests/${resolvedParams.testId}/embed`);
            if (embedRes.ok) {
              const embedData = await embedRes.json();
              setEmbedCode(embedData.embedCode);
            } else {
              toast.error('Failed to load test content');
            }
          }
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
        toast.error('Failed to verify access');
      } finally {
        setIsLoading(false);
      }
    };

    checkAccessAndLoadEmbed();
  }, [resolvedParams.testId, session]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <LogIn className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Let's Get Started!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please log in to begin your test.
            </p>
            <Button onClick={() => router.push('/login')} className="inline-flex items-center justify-center w-full">
              <span className="font-semibold">Login</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Required</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              It looks like you don't have access to this test. You can purchase it to get started.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push(`/ptests/${resolvedParams.testId}`)} 
                className="inline-flex items-center justify-center w-full"
              >
                <span className="font-semibold">View Test Details</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/ptests')} 
                className="inline-flex items-center justify-center w-full"
              >
                <span className="font-semibold">Browse All Tests</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full">
        <div className="absolute top-4 left-4 z-100">
          <Link href="/Tests" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm">Back</span>
          </Link>
        </div>

        {uniqueCode && (
          <div className="absolute top-4 right-4 z-50">
            <div className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-xs font-bold">✓</span>
              </div>
              <div className="flex gap-1 items-center">
                <h3 className="text-xs font-semibold text-green-800 dark:text-green-300">Access Code: </h3>
                <div className="text-sm font-mono font-bold text-green-700 dark:text-green-300 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-green-300 dark:border-green-700">
                  {uniqueCode}
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(uniqueCode);
                    toast.success('Access code copied!');
                  }}
                  className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 mt-1 underline ml-3"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}

        {embedCode ? (
          <div 
            className="w-full h-[150vh] pt-16 bg-white"
            style={{ 
              position: 'relative',
              overflow: 'visible'
            }}
            dangerouslySetInnerHTML={{ __html: embedCode }}
          />
        ) : (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading test content...</p>
          </div>
        )}
        
      </div>
    </div>
  );
}
