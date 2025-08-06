'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function TestHistoryPage() {
  const [testHistory, setTestHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/profile/purchase-history?type=test')
      .then(res => setTestHistory(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full flex justify-start items-start min-h-[60vh] rounded-3xl">
      <Card className="w-full h-full rounded-3xl shadow-none bg-white/90">
        <CardHeader>
          <CardTitle className='py-6'>Test History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground text-center py-8">Loading...</div>
          ) : testHistory.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">No test purchases found.</div>
          ) : (
            <ul className="space-y-4">
              {testHistory.map((item, idx) => (
                <li key={item._id || idx} className="flex flex-col md:flex-row md:items-center md:gap-4 border-b pb-2">
                  <span className="font-semibold">{item.testTitle}</span>
                  <span className="text-xs text-gray-500">{new Date(item.purchasedAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

