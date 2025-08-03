import React from 'react';
import { Card } from '@/components/ui/card';

interface TestCardSkeletonProps {
  variant: 'featured' | 'big' | 'small' | 'compact' | 'grid';
  className?: string;
}

export default function TestCardSkeleton({ variant, className = "" }: TestCardSkeletonProps) {
  const getSkeletonClasses = () => {
    const baseClasses = "animate-pulse w-full";
    
    switch (variant) {
      case "featured":
        return `${baseClasses} bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-lg`;
      case "big":
        return `${baseClasses} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md`;
      case "small":
        return `${baseClasses} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm`;
      case "compact":
        return `${baseClasses} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm`;
      case "grid":
        return `${baseClasses} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md`;
      default:
        return baseClasses;
    }
  };

  const getImageClasses = () => {
    switch (variant) {
      case "featured":
        return "w-80 h-48 bg-gray-200 dark:bg-gray-700 flex-shrink-0";
      case "big":
        return "w-64 h-40 bg-gray-200 dark:bg-gray-700 flex-shrink-0";
      case "small":
        return "w-32 h-24 bg-gray-200 dark:bg-gray-700 flex-shrink-0";
      case "compact":
        return "w-24 h-20 bg-gray-200 dark:bg-gray-700 flex-shrink-0";
      case "grid":
        return "w-56 h-36 bg-gray-200 dark:bg-gray-700 flex-shrink-0";
      default:
        return "w-64 h-40 bg-gray-200 dark:bg-gray-700 flex-shrink-0";
    }
  };

  const getContentClasses = () => {
    switch (variant) {
      case "small":
      case "compact":
        return "flex-1 p-3";
      default:
        return "flex-1 p-6";
    }
  };

  const getTitleClasses = () => {
    switch (variant) {
      case "featured":
        return "h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3";
      case "big":
        return "h-5 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-3";
      case "small":
        return "h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2";
      case "compact":
        return "h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-2";
      case "grid":
        return "h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3";
      default:
        return "h-5 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-3";
    }
  };

  const getDescClasses = () => {
    switch (variant) {
      case "featured":
      case "big":
      case "grid":
        return "h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2";
      default:
        return "h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-2";
    }
  };

  const getStatsClasses = () => {
    switch (variant) {
      case "compact":
        return "h-2 w-1/2 bg-gray-200 dark:bg-gray-700 rounded";
      default:
        return "h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded";
    }
  };

  return (
    <Card className={`${getSkeletonClasses()} ${className}`}>
      <div className="flex h-full">
        {/* Image skeleton */}
        <div className={getImageClasses()} />
        
        {/* Content skeleton */}
        <div className={getContentClasses()}>
          <div className="flex flex-col h-full">
            {/* Title skeleton */}
            <div className={getTitleClasses()} />
            
            {/* Description skeleton - only for larger variants */}
            {(variant === "featured" || variant === "big" || variant === "grid") && (
              <div className="space-y-2 mb-4">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            )}
            
            {/* Stats skeleton */}
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-4 mb-3">
                <div className={getStatsClasses()} />
                <div className={getStatsClasses()} />
                <div className={getStatsClasses()} />
              </div>
              
              {/* Badges and action skeleton */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  {(variant === "featured" || variant === "big") && (
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  )}
                </div>
                
                {/* Action button skeleton for featured variant */}
                {variant === "featured" && (
                  <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 