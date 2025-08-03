"use client";
import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  Lock, 
  Shield, 
  CreditCard,
  CheckCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import PaymentOptionsModal from '@/components/PaymentOptionsModal';

export default function TestDetailPage({ params }: { params: { slug: string } }) {
  console.log('TestDetailPage params:', params);
  const [test, setTest] = useState<any>(null);
  const [embedCode, setEmbedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingEmbed, setLoadingEmbed] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);
  const [testLink, setTestLink] = useState<string | null>(null);
  const { data: session } = useSession();
  const [userCode, setUserCode] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/tests`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const tests = await res.json();
        console.log('Looking for test with ID:', params.slug);
        const foundTest = tests.find((t: any) => t._id === params.slug);
        console.log('Found test:', foundTest);
        if (foundTest) {
          setTest(foundTest);
          // Find assigned code for current user
          const userId = session?.user?.id;
          if (userId && foundTest.uniqueCodes) {
            const codeObj = foundTest.uniqueCodes.find((c: any) => c.assignedTo === userId);
            if (codeObj) setUserCode(codeObj.code);
          }
        }
      } catch (error) {
        console.error('Error fetching test:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkAccess = async () => {
      try {
        const res = await fetch('/api/verify-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testId: params.slug }),
        });
        
        if (res.ok) {
          const data = await res.json();
          setHasAccess(data.hasAccess);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    fetchData();
    checkAccess();
  }, [params.slug, session?.user?.id]);

  const handleStartLoadedTest = async () => {
    setLoadingEmbed(true);
    try {
      const res = await fetch(`/api/protected-tests/${params.slug}/embed`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch embed code: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!data.embedCode) {
        throw new Error('No embed code in response');
      }
      
      setEmbedCode(data.embedCode);
      setShowEmbed(true);
    } catch (e) {
      console.error('Error loading embed code:', e);
      toast.error(`Failed to load test: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setLoadingEmbed(false);
    }
  };

  const handlePaymentSuccess = (paymentData: any, uniqueCode?: string) => {
    setHasAccess(true);
    if (uniqueCode) {
      toast.success(`Payment successful! Your unique access code: ${uniqueCode}`);
    } else {
      toast.success('Payment successful! You now have access to this test.');
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
  };

  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Test Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">The test you're looking for doesn't exist.</p>
            <Link href="/Tests">
              <Button>Back to Tests</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Test Header */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-8 overflow-hidden shadow-xl">
            <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
              <img
                src={test.thumbnailUrl || "/ppnim_logo.svg"}
                alt={test.title}
                className="w-full h-full object-cover"
              />
              {!hasAccess && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Lock className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-lg font-semibold">Test Locked</p>
                    <p className="text-sm">Purchase to unlock this test</p>
                  </div>
                </div>
              )}
            </div>
            
            <CardContent className="p-6">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{test.title}</CardTitle>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{test.description?.en}</p>
              
              {/* Test Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Star className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Difficulty</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{test.difficulty || 'Medium'}</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Clock className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{test.duration || '30 min'}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Taken</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{test.takenCount || 0}</p>
                </div>
              </div>

              {/* Access Control */}
              <div className="w-full text-center p-6 bg-gradient-to-r from-blue-50 to-yellow-50 dark:from-blue-900/20 dark:to-yellow-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                {hasAccess ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                      <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">Test Unlocked!</h3>
                    <p className="text-green-600 dark:text-green-400 text-sm mb-4">You have access to this test</p>
                    
                    <Button 
                      onClick={() => router.push(`/test-embed/${params.slug}`)}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
                    >
                      Start Test
                      <Play className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                      <Lock className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Test Locked</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Purchase this test to unlock access</p>
                    <Button 
                      onClick={() => {
                        if (!test || !params.slug) {
                          toast.error('Test data not available. Please refresh the page.');
                          return;
                        }
                        console.log('Opening payment modal with itemId:', params.slug);
                        setShowPaymentModal(true);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Purchase Test - ₮{test.price}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Details */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Test Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Test Type</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{test.testType}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Times Taken</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{test.takenCount || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Price</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₮{test.price}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Access Status</span>
                  <span className={`font-semibold ${hasAccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {hasAccess ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Options Modal */}
      {test && params.slug && (
        <PaymentOptionsModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          itemId={params.slug}
          itemType="test"
          itemTitle={test.title || ''}
          itemDescription={test.description?.en || ''}
          price={test.price || 0}
          thumbnailUrl={test.thumbnailUrl}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
      {/* Debug info */}
      <div style={{display: 'none'}}>
        Debug: params.slug = {params.slug}, test._id = {test?._id}
      </div>
    </div>
  );
}