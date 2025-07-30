"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, BookOpen, Clock, Users } from 'lucide-react';

interface TestcardsProps {
  hr: string;
  shortDes: string;
  slug: string;
  thumbnailUrl?: string;
  variant: "big" | "small";
  price?: number;
  takenCount?: number;
  questionCount?: number;
}

const MAX_DESC_LENGTH = 100;

const TestCards = ({ hr, shortDes, slug, variant, thumbnailUrl, price, takenCount, questionCount }: TestcardsProps) => {
  const [showFull, setShowFull] = useState(false);
  const her: string = hr;
  const shortDescription: string = shortDes;
  const imageUrl = thumbnailUrl || "/ppnim_logo.svg";
  const isLong = shortDescription.length > MAX_DESC_LENGTH;
  const displayDesc = showFull || !isLong ? shortDescription : shortDescription.slice(0, MAX_DESC_LENGTH) + '...';

  return (
    <Link href={`/ptests/${slug}`} className={`${variant === "big" ? "w-full max-w-xl" : "w-[48%]"} group`}>
      <Card className={`overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-0 shadow-sm bg-white ${variant === "big" ? "flex-col" : "flex-row items-stretch"}`}>
        {/* Image Section */}
        <div className={`relative ${variant === "big" ? "w-full h-56" : "w-20 h-20 flex-shrink-0"} bg-gray-100 overflow-hidden h-full`}>
          <Image
            src={imageUrl}
            alt={hr}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105 h-full"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Price badge - only show on big variant */}
          {variant === "big" && typeof price === 'number' && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-white/90 text-gray-900 font-semibold px-3 py-1">
                ₮{price}
              </Badge>
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className={`${variant === "big" ? "p-4 w-full" : "p-3 flex-1 min-w-0"}`}>
          {/* Title */}
          <CardTitle className={`font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors ${variant === "big" ? "text-xl" : "text-sm"}`}>
            {hr}
          </CardTitle>
          
          {/* Description */}
          <CardDescription className={`text-gray-600 line-clamp-2 ${variant === "big" ? "text-base mb-3" : "text-xs mb-2"}`}>
            {displayDesc}
            {variant === "big" && isLong && !showFull && (
              <button
                type="button"
                className="ml-2 text-blue-600 underline text-xs"
                onClick={e => {
                  e.preventDefault();
                  setShowFull(true);
                }}
              >
                See more
              </button>
            )}
            {variant === "big" && isLong && showFull && (
              <button
                type="button"
                className="ml-2 text-blue-600 underline text-xs"
                onClick={e => {
                  e.preventDefault();
                  setShowFull(false);
                }}
              >
                See less
              </button>
            )}
          </CardDescription>

          {/* Test Stats - only show on big variant */}
          {variant === "big" && (
            <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
              {questionCount && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-blue-600" />
                  <span>{questionCount} questions</span>
                </div>
              )}
              {takenCount && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-green-600" />
                  <span>{takenCount} attempts</span>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className={`flex items-center justify-between ${variant === "big" ? "pt-2 border-t border-gray-100" : ""}`}>
            {variant === "big" ? (
              <>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Take Test</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600 group-hover:text-blue-700 transition-colors">
                  <span className="text-sm font-medium">Start Test</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Take Test</span>
                </div>
                <div className="flex items-center gap-2">
                  {typeof price === 'number' && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <span className="font-medium">₮{price}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-blue-600 group-hover:text-blue-700 transition-colors">
                    <span className="text-xs font-medium">Start Test</span>
                    <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default TestCards;
export const LazyTestCards = React.lazy(() => import('./TestCards'));
