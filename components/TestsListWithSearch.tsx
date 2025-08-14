'use client'

import React, { useEffect, useState } from 'react';
import TestCard from '@/components/testCard';
import TestCardSkeleton from '@/components/home/TestCardsSkeleton';
import { Search, Star, Brain, Stethoscope, User, BookOpen, TrendingUp, Clock, Award } from 'lucide-react';
import { useLanguage } from '@/lib/language';
import { getLocalizedTitle } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';

interface Test {
  id: string;
  _id?: string;
  title: string;
  description: { en: string; mn: string };
  thumbnailUrl?: string;
  testType?: 'Talent' | 'Aptitude' | 'Clinic' | 'Personality';
  price?: number;
  takenCount?: number;
  questionCount?: number;
  duration?: number;
  rating?: number;
  isNew?: boolean;
  isPopular?: boolean;
  isRecommended?: boolean;
  hasAccess?: boolean;
}

export default function TestsListWithSearch() {
  const { t, language } = useLanguage();
  const { data: session } = useSession();
  const [tests, setTests] = useState<Test[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTestType, setSelectedTestType] = useState<string>('all');
  const [filtered, setFiltered] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'name' | 'price'>('popular');

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/tests');
        const data = await res.json();
        
        // Add mock data for demonstration
        const enhancedData = data.map((test: Test, index: number) => ({
          ...test,
          duration: Math.floor(Math.random() * 30) + 10, // 10-40 minutes
          rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0
          isNew: index < 3, // First 3 tests are new
          isPopular: Math.random() > 0.7, // 30% chance of being popular
          isRecommended: Math.random() > 0.8, // 20% chance of being recommended
        }));
        
        setTests(enhancedData);
        setFiltered(enhancedData);
      } catch {
        setTests([]);
        setFiltered([]);
      }
      setLoading(false);
    };
    fetchTests();
  }, []);

  // Check user access for tests
  useEffect(() => {
    const checkUserAccess = async () => {
      if (!session?.user?.id) return;

      try {
        const res = await fetch('/api/profile/purchased-courses');
        if (res.ok) {
          const purchaseData = await res.json();
          const purchasedTests = purchaseData.tests || [];
          
          setTests(prevTests => 
            prevTests.map(test => ({
              ...test,
              hasAccess: purchasedTests.some((p: any) => p.test?._id === test.id)
            }))
          );
        }
      } catch (error) {
        console.error('Error checking user access:', error);
      }
    };

    checkUserAccess();
  }, [session?.user?.id]);

  useEffect(() => {
    let filtered = tests;
    
    // Filter by test type
    if (selectedTestType !== 'all') {
      filtered = filtered.filter(t => t.testType === selectedTestType);
    }
    
    // Filter by search
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.title.toLowerCase().includes(s) ||
          t.description?.en?.toLowerCase().includes(s) ||
          t.description?.mn?.toLowerCase().includes(s)
      );
    }
    
    // Sort tests
    switch (sortBy) {
      case 'popular':
        filtered = filtered.sort((a, b) => (b.takenCount || 0) - (a.takenCount || 0));
        break;
      case 'newest':
        filtered = filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'name':
        filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'price':
        filtered = filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
    }
    
    setFiltered(filtered);
  }, [search, selectedTestType, tests, sortBy]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getTestTypeCount = (type: string) => {
    return tests.filter(t => t.testType === type).length;
  };

  return (
    <div className='w-full max-w-7xl mx-auto mt-6'>
      {/* Header with stats */}
      <div className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Tests</p>
                <p className="text-2xl font-bold">{tests.length}</p>
              </div>
              <BookOpen className="w-8 h-8 opacity-80 inline-block" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Talent</p>
                <p className="text-2xl font-bold">{getTestTypeCount('Talent')}</p>
              </div>
              <Star className="w-8 h-8 opacity-80 inline-block" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Aptitude</p>
                <p className="text-2xl font-bold">{getTestTypeCount('Aptitude')}</p>
              </div>
              <Brain className="w-8 h-8 opacity-80 inline-block" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Clinic</p>
                <p className="text-2xl font-bold">{getTestTypeCount('Clinic')}</p>
              </div>
              <Stethoscope className="w-8 h-8 opacity-80 inline-block" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Personality</p>
                <p className="text-2xl font-bold">{getTestTypeCount('Personality')}</p>
              </div>
              <User className="w-8 h-8 opacity-80 inline-block" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 inline-block" />
          <input
            type="text"
            placeholder="Search for tests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
        >
          <option value="popular">Most Popular</option>
          <option value="newest">Newest</option>
          <option value="name">Name A-Z</option>
          <option value="price">Price Low-High</option>
        </select>
      </div>

      {/* Test Type Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedTestType('all')}
          className={`px-4 py-2 text-sm rounded-lg border transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105 active:scale-95 ${
            selectedTestType === 'all'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
          }`}
        >
          <BookOpen className={`w-4 h-4 ${selectedTestType === 'all' ? 'text-white' : 'text-blue-500'} inline-block`} />
          All Types ({tests.length})
        </button>
        <button
          onClick={() => setSelectedTestType('Talent')}
          className={`px-4 py-2 text-sm rounded-lg border transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105 active:scale-95 ${
            selectedTestType === 'Talent'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
          }`}
        >
          <Star className={`w-4 h-4 ${selectedTestType === 'Talent' ? 'text-white' : 'text-blue-500'} inline-block`} />
          Talent ({getTestTypeCount('Talent')})
        </button>
        <button
          onClick={() => setSelectedTestType('Aptitude')}
          className={`px-4 py-2 text-sm rounded-lg border transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105 active:scale-95 ${
            selectedTestType === 'Aptitude'
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-500 shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
          }`}
        >
          <Brain className={`w-4 h-4 ${selectedTestType === 'Aptitude' ? 'text-white' : 'text-emerald-500'} inline-block`} />
          Aptitude ({getTestTypeCount('Aptitude')})
        </button>
        <button
          onClick={() => setSelectedTestType('Clinic')}
          className={`px-4 py-2 text-sm rounded-lg border transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105 active:scale-95 ${
            selectedTestType === 'Clinic'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-500 shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
          }`}
        >
          <Stethoscope className={`w-4 h-4 ${selectedTestType === 'Clinic' ? 'text-white' : 'text-purple-500'} inline-block`} />
          Clinic ({getTestTypeCount('Clinic')})
        </button>
        <button
          onClick={() => setSelectedTestType('Personality')}
          className={`px-4 py-2 text-sm rounded-lg border transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105 active:scale-95 ${
            selectedTestType === 'Personality'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500 shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
          }`}
        >
          <User className={`w-4 h-4 ${selectedTestType === 'Personality' ? 'text-white' : 'text-orange-500'} inline-block`} />
          Personality ({getTestTypeCount('Personality')})
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(6)].map((_, i) => (
            <TestCardSkeleton key={i} variant="big" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600 inline-block" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tests found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Button onClick={() => { setSearch(''); setSelectedTestType('all'); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((test, index) => (
            <div key={test.id} className="stagger-item">
              <TestCard
                _id={test._id || test.id}
                title={getLocalizedTitle(test.title, language)}
                description={test.description}
                slug={test._id || test.id}
                thumbnailUrl={test.thumbnailUrl}
                variant="big"
                testType={test.testType}
                price={test.price}
                takenCount={test.takenCount}
                questionCount={test.questionCount}
                duration={test.duration}
                rating={test.rating}
                isNew={test.isNew}
                isPopular={test.isPopular}
                isRecommended={test.isRecommended}
                hasAccess={test.hasAccess}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 