"use client";
import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function TestDetailPage({ params }: { params: { slug: string } }) {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/tests`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const tests = await res.json();
        const foundTest = tests.find((t: any) => t._id === params.slug);
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.slug, session?.user?.id]);

  const handleStartTest = async () => {
    if (test?._id) {
      try {
        await fetch(`/api/tests/${test._id}/taken`, { method: 'POST' });
      } catch (e) {}
    }
    router.push(`/pay/${test._id}?returnTo=/ptests/${params.slug}`);
  };

  const handleStartLoadedTest = async () => {
    setLoadingEmbed(true);
    try {
      const res = await fetch(`/api/protected-tests/${params.slug}/embed`);
      if (!res.ok) throw new Error('Failed to fetch embed code');
      const data = await res.json();
      setEmbedCode(data.embedCode);
      if (typeof window !== 'undefined' && data.embedCode) {
        const parser = new window.DOMParser();
        const doc = parser.parseFromString(data.embedCode, "text/html");
        const aTag = doc.querySelector("a");
        if (aTag && aTag.href) {
          setTestLink(aTag.href);
        } else {
          setTestLink(null);
        }
      }
      setShowEmbed(true);
    } catch (e) {
    } finally {
      setLoadingEmbed(false);
    }
  };

  if (loading) return <div className="p-8">Start test (slug: {params.slug})</div>;
  if (!test) return <div className="p-8">Test not found. (slug: {params.slug})</div>;

  const isPaid = searchParams.get('paid') === '1';

  return (
    <div className="min-h-screen py-4 flex flex-col items-center">
      <div className='w-full'>
      <Breadcrumbs />
      </div>
      <div className="mt-8 w-full max-w-xl sm:max-w-lg mx-auto dark:bg-card overflow-hidden rounded-3xl border-1 border-gray-300" >
        <div className="relative w-full h-56 bg-gray-100 dark:bg-muted rounded-3xl border-2 border-gray-200">
          <Image
            src={test.thumbnailUrl || "/ppnim_logo.svg"}
            alt={test.title}
            fill
            className="object-cover w-full h-full rounded-xl"
            priority
          />
        </div>

        <div className="p-8 flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-primary mb-1">{test.title}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-2 line-clamp-4">{test.description?.en}</p>
          <div className="text-xl font-medium text-gray-700 mb-2">Price:  {test.price}₮</div>
          {userCode && (
            <div className="p-3 bg-gray-100 border border-gray-200 rounded-2xl text-gray-800 text-center font-mono">
              Your Unique Code: <span className="font-bold text-blue-900">{userCode}</span>
            </div>
          )}
          {!isPaid ? (
            <Button onClick={handleStartTest} className="w-full py-3 text-lg font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition">
              Start Test
            </Button>
          ) : (
            loadingEmbed ? (
              <div className="mt-4 pt-4 text-center text-muted-foreground text-sm">Loading test...</div>
            ) : !showEmbed ? (
              <div className="mt-4 pt-4">
                <Button onClick={handleStartLoadedTest} className="w-full py-3 text-lg font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                  Start the test
                </Button>
                {embedCode && (
                  <div ref={embedRef} style={{ display: "none" }} dangerouslySetInnerHTML={{ __html: embedCode || '' }} />
                )}
              </div>
            ) : testLink ? (
              <div className="mt-4 pt-4">
                <Link href={testLink} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full py-3 text-lg font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                    Start the test
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="mt-4 pt-4">
                <div ref={embedRef} dangerouslySetInnerHTML={{ __html: embedCode || '' }} />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}