"use client";
import { useEffect, useState } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TestEmbedPage({ params }: { params: { testId: string } }) {
  const [embedCode, setEmbedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [uniqueCode, setUniqueCode] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkAccessAndLoadEmbed = async () => {
      try {
        console.log('🔍 Checking access for test:', params.testId);
        
        // First check if user has access to this test
        const accessRes = await fetch('/api/verify-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testId: params.testId }),
        });

        console.log('Access check response status:', accessRes.status);

        if (accessRes.ok) {
          const accessData = await accessRes.json();
          console.log('Access check response:', accessData);
          console.log('Unique code received:', accessData.uniqueCode);
          setHasAccess(accessData.hasAccess);
          setUniqueCode(accessData.uniqueCode);
          
          if (accessData.hasAccess) {
            console.log('✅ User has access, loading embed code...');
            // User has access, load the embed code
            const embedRes = await fetch(`/api/protected-tests/${params.testId}/embed`);
            
            console.log('Embed API response status:', embedRes.status);
            
            if (embedRes.ok) {
              const embedData = await embedRes.json();
              console.log('Embed data received:', embedData);
              console.log('Embed code length:', embedData.embedCode?.length || 0);
              setEmbedCode(embedData.embedCode);
            } else {
              const errorText = await embedRes.text();
              console.error('Embed API error:', errorText);
              toast.error('Failed to load test content');
            }
          } else {
            console.log('❌ User does not have access');
            // TEMPORARY: Bypass access check for testing
            console.log('🔄 TEMPORARY: Bypassing access check for testing...');
            const embedRes = await fetch(`/api/protected-tests/${params.testId}/embed`);
            if (embedRes.ok) {
              const embedData = await embedRes.json();
              console.log('Embed data received (bypass):', embedData);
              setEmbedCode(embedData.embedCode);
            }
          }
        } else {
          const errorText = await accessRes.text();
          console.error('Access check error:', errorText);
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
        toast.error('Failed to verify access');
      } finally {
        setLoading(false);
        setCheckingAccess(false);
      }
    };

    if (session) {
      checkAccessAndLoadEmbed();
    } else {
      setLoading(false);
      setCheckingAccess(false);
    }
  }, [params.testId, session]);

  if (loading || checkingAccess) {
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
            <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You need to be logged in to access this test.
            </p>
            <Button onClick={() => router.push('/login')} className="w-full">
              Login
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
            <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You don't have access to this test. Please purchase it first.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push(`/ptests/${params.testId}`)} 
                className="w-full"
              >
                View Test Details
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/ptests')} 
                className="w-full"
              >
                Browse All Tests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/Tests" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Tests
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Protected Test</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Unique Code Display */}
        {uniqueCode && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">Your Access Code</h3>
                  <p className="text-xs text-green-600 dark:text-green-400">Use this code to access your test results</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-mono font-bold text-green-700 dark:text-green-300 bg-white dark:bg-gray-800 px-3 py-1 rounded border border-green-300 dark:border-green-700">
                  {uniqueCode}
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(uniqueCode);
                    toast.success('Access code copied to clipboard!');
                  }}
                  className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 mt-1 underline"
                >
                  Copy Code
                </button>
              </div>
            </div>
          </div>
        )}

        {embedCode ? (
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-8"
            style={{
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}
            onContextMenu={(e) => e.preventDefault()}
            ref={(el) => {
              if (el && embedCode) {
                el.innerHTML = embedCode;
                // Execute any scripts in the embed code
                const scripts = el.querySelectorAll('script');
                scripts.forEach(script => {
                  const newScript = document.createElement('script');
                  if (script.src) {
                    newScript.src = script.src;
                  } else {
                    newScript.textContent = script.textContent;
                  }
                  document.head.appendChild(newScript);
                });
              }
            }}
          />
        ) : (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading test content...</p>
            <p className="text-sm text-gray-500 mt-2">Debug: hasAccess={hasAccess.toString()}, embedCode={embedCode ? 'exists' : 'null'}</p>
          </div>
        )}
      </div>
    </div>
  );
} 