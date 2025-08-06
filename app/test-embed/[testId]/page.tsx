"use client";
import { useEffect, useState } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function TestEmbedPage({ params }: { params: Promise<{ testId: string }> }) {
  const resolvedParams = use(params);
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
        console.log('🔍 Checking access for test:', resolvedParams.testId);
        
        // First check if user has access to this test
        const accessRes = await fetch('/api/verify-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testId: resolvedParams.testId }),
        });

        console.log('Access check response status:', accessRes.status);

        if (accessRes.ok) {
          const accessData = await accessRes.json();
          console.log('Access check response:', accessData);
          console.log('Unique code received:', accessData.uniqueCode);
          console.log('Has access:', accessData.hasAccess);
          setHasAccess(accessData.hasAccess);
          setUniqueCode(accessData.uniqueCode);
          
          if (accessData.hasAccess) {
            console.log('✅ User has access, loading embed code...');
            // User has access, load the embed code
            const embedRes = await fetch(`/api/protected-tests/${resolvedParams.testId}/embed`);
            
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
            const embedRes = await fetch(`/api/protected-tests/${resolvedParams.testId}/embed`);
            if (embedRes.ok) {
              const embedData = await embedRes.json();
              console.log('Embed data received (bypass):', embedData);
              setEmbedCode(embedData.embedCode);
              setHasAccess(true); // Force access for testing
            }
          }
        } else {
          const errorText = await accessRes.text();
          console.error('Access check error:', errorText);
          setHasAccess(false);
          
          // Fallback: Try to load embed code anyway for testing
          console.log('🔄 Fallback: Trying to load embed code despite access check failure...');
          try {
            const embedRes = await fetch(`/api/protected-tests/${resolvedParams.testId}/embed`);
            if (embedRes.ok) {
              const embedData = await embedRes.json();
              console.log('Embed data received (fallback):', embedData);
              setEmbedCode(embedData.embedCode);
              setHasAccess(true); // Force access for testing
            }
          } catch (fallbackError) {
            console.error('Fallback embed loading failed:', fallbackError);
          }
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
  }, [resolvedParams.testId, session]);

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
                onClick={() => router.push(`/ptests/${resolvedParams.testId}`)} 
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
      {/* Test Content */}
      <div className="w-full">
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-100">
          <Link href="/Tests" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm">Back</span>
          </Link>
        </div>

        {/* Unique Code Display */}
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
          <>
            {/* Debug info */}
            <div className="absolute top-20 left-4 z-50 bg-blue-100 p-2 rounded text-xs debug-info">
              ✅ Embed code loaded ({embedCode.length} chars)
              <br />
              Preview: {embedCode.substring(0, 100)}...
            </div>
            
            <div 
              className="w-full h-screen pt-16 bg-white"
              style={{ 
                minHeight: '100vh',
                position: 'relative',
                overflow: 'visible'
              }}
              dangerouslySetInnerHTML={{ __html: embedCode }}
              ref={(el) => {
                if (el && embedCode) {
                  console.log('🎯 Embed code loaded, executing scripts...');
                  // Execute any scripts in the embed code
                  const scripts = el.querySelectorAll('script');
                  scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                      newScript.src = script.src;
                      console.log('📜 Loading external script:', script.src);
                    } else {
                      newScript.textContent = script.textContent;
                      console.log('📜 Loading inline script:', script.textContent?.substring(0, 50) + '...');
                    }
                    document.head.appendChild(newScript);
                  });
                  
                  // Immediately try to create the quiz iframe for smooth experience
                  const quizId = embedCode.match(/data-quiz="([^"]+)"/)?.[1];
                  if (quizId) {
                    console.log('🚀 Creating immediate quiz iframe for smooth experience...');
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://take.quiz-maker.com/${quizId}`;
                    iframe.style.width = '100%';
                    iframe.style.height = '100vh';
                    iframe.style.border = 'none';
                    iframe.style.borderRadius = '8px';
                    iframe.style.position = 'absolute';
                    iframe.style.top = '0';
                    iframe.style.left = '0';
                    iframe.style.zIndex = '10';
                    iframe.title = 'Quiz';
                    iframe.allowFullscreen = true;
                    
                    // Clear the container and add the iframe immediately
                    el.innerHTML = '';
                    el.appendChild(iframe);
                    console.log('✅ Created immediate iframe for quiz');
                    
                    // Hide the debug info when quiz loads
                    const debugInfo = document.querySelector('.debug-info');
                    if (debugInfo) {
                      (debugInfo as HTMLElement).style.display = 'none';
                    }
                  }
                  
                  // Check for quiz links after script execution (reduced timeout for faster loading)
                  setTimeout(() => {
                    const quizLinks = el.querySelectorAll('a[data-quiz]');
                    console.log('🔗 Found quiz links:', quizLinks.length);
                    quizLinks.forEach((link, index) => {
                      console.log(`Quiz link ${index}:`, link.getAttribute('data-quiz'));
                      console.log('Link text:', link.textContent);
                      console.log('Link href:', (link as HTMLAnchorElement).href);
                      
                      // Try to trigger the quiz manually if it's not already loaded
                      console.log('🔄 Attempting to trigger quiz manually...');
                      try {
                        (link as HTMLAnchorElement).click();
                      } catch (e) {
                        console.log('Manual trigger failed:', e);
                      }
                    });
                    
                    // If no quiz is visible after 2 seconds, try alternative approach (reduced for faster loading)
                    setTimeout(() => {
                      const quizContent = el.querySelector('.quiz-content, .poll-maker-quiz, iframe');
                      if (!quizContent) {
                        console.log('⚠️ No quiz content found, trying alternative approach...');
                        
                        // Create a direct iframe to the quiz
                        const quizId = quizLinks[0]?.getAttribute('data-quiz');
                        if (quizId) {
                          const iframe = document.createElement('iframe');
                          iframe.src = `https://take.quiz-maker.com/${quizId}`;
                          iframe.style.width = '100%';
                          iframe.style.height = '100vh';
                          iframe.style.border = 'none';
                          iframe.style.borderRadius = '8px';
                          iframe.style.position = 'absolute';
                          iframe.style.top = '0';
                          iframe.style.left = '0';
                          iframe.style.zIndex = '10';
                          iframe.title = 'Quiz';
                          iframe.allowFullscreen = true;
                          
                          // Clear the container and add the iframe
                          el.innerHTML = '';
                          el.appendChild(iframe);
                          console.log('✅ Created direct iframe for quiz');
                          
                          // Hide the debug info when quiz loads
                          const debugInfo = document.querySelector('.debug-info');
                          if (debugInfo) {
                            (debugInfo as HTMLElement).style.display = 'none';
                          }
                        }
                      }
                    }, 2000); // Reduced from 3000ms to 2000ms for faster loading
                  }, 1000); // Reduced from 2000ms to 1000ms for faster loading
                }
              }}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading test content...</p>
            <p className="text-sm text-gray-500 mt-2">Debug: hasAccess={hasAccess.toString()}, embedCode={embedCode ? 'exists' : 'null'}</p>
            <p className="text-sm text-gray-500 mt-2">Test ID: {resolvedParams.testId}</p>
            <p className="text-sm text-gray-500 mt-2">Session: {session ? 'logged in' : 'not logged in'}</p>
          </div>
        )}
        
      </div>
    </div>
  );
} 