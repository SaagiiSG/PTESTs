'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { useLanguage } from '@/lib/language';

export default function CourseHistoryPage() {
  const [courseHistory, setCourseHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    api.get('/api/profile/purchase-history?type=course')
      .then(res => setCourseHistory(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full flex justify-center items-start min-h-[60vh]">
      <Card className="w-full h-full py-6 rounded-3xl shadow-none bg-white/90">
        <CardHeader>
          <CardTitle>{t('courseHistory')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground text-center py-8">{t('loading')}</div>
          ) : courseHistory.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">No course purchases found.</div>
          ) : (
            <ul className="space-y-4">
              {courseHistory.map((item, idx) => (
                <li key={item._id || idx}>
                  <Link href={`/Course/${item.courseId}`} className="block">
                    <div className="flex items-center gap-3 p-2 bg-white rounded-md shadow border w-full max-w-xs hover:bg-yellow-50 transition">
                      <img
                        src={item.thumbnailUrl || '/ppnim_logo.svg'}
                        alt={item.courseTitle}
                        className="w-12 h-12 object-cover rounded border"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base truncate">{item.courseTitle}</div>
                        <div className="text-xs text-gray-500 truncate">{new Date(item.purchasedAt).toLocaleString()}</div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 