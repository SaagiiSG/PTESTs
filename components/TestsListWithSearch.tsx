'use client'

import React, { useEffect, useState } from 'react';
import TestCards from '@/components/home/TestCards';
import { Search } from 'lucide-react';

interface Test {
  _id: string;
  title: string;
  description: { en: string; mn: string };
  thumbnailUrl?: string;
}

export default function TestsListWithSearch() {
  const [tests, setTests] = useState<Test[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/tests');
        const data = await res.json();
        setTests(data);
        setFiltered(data);
      } catch {
        setTests([]);
        setFiltered([]);
      }
      setLoading(false);
    };
    fetchTests();
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(tests);
    } else {
      const s = search.toLowerCase();
      setFiltered(
        tests.filter(
          t =>
            t.title.toLowerCase().includes(s) ||
            t.description?.en?.toLowerCase().includes(s) ||
            t.description?.mn?.toLowerCase().includes(s)
        )
      );
    }
  }, [search, tests]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className='w-full'>
    <div className="w-[87wv]  mx-auto p-4">
      <div className="flex gap-2 p-3 px-5 text-[16px] rounded-xl bg-gray-200 shadow-md mb-12">
        <Search />
        <input
          type="text"
          placeholder="Search for tests"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="outline-0 bg-gray-200 flex-1"
        />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500">No tests found.</div>
      ) : (
        <ul className="flex flex-col gap-4">
          {filtered.map(test => (
            <li key={test._id}>
              <TestCards
                hr={test.title}
                shortDes={test.description?.en}
                slug={test._id}
                thumbnailUrl={test.thumbnailUrl}
                variant={isMobile ? 'big' : 'small'}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
    </div>
  );
} 