import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const CourseCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden border-0 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
      {/* Image skeleton */}
      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div className="absolute inset-0 skeleton" />
      </div>

      {/* Content skeleton */}
      <CardContent className="p-4">
        {/* Title skeleton */}
        <div className="mb-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded skeleton w-3/4" />
        </div>
        
        {/* Description skeleton */}
        <div className="mb-3 space-y-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded skeleton w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded skeleton w-2/3" />
        </div>

        {/* Lessons skeleton */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded skeleton" />
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded skeleton w-24" />
          </div>
          <div className="space-y-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full skeleton" />
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded skeleton w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer skeleton */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-200 dark:bg-gray-600 rounded skeleton" />
            <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded skeleton w-16" />
          </div>
          <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded skeleton w-20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCardSkeleton; 