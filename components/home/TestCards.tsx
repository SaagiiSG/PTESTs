"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

interface TestcardsProps {
  hr: string;
  shortDes: string;
  slug: string;
  thumbnailUrl?: string;
  variant: "big" | "small";
  price?: number;
}

const MAX_DESC_LENGTH = 100;

const TestCards = ({ hr, shortDes, slug, variant, thumbnailUrl, price }: TestcardsProps) => {
  const [showFull, setShowFull] = useState(false);
  const her: string = hr;
  const shortDescription: string = shortDes;
  const imageUrl = thumbnailUrl || "/ppnim_logo.svg";
  const isLong = shortDescription.length > MAX_DESC_LENGTH;
  const displayDesc = showFull || !isLong ? shortDescription : shortDescription.slice(0, MAX_DESC_LENGTH) + '...';

  return (
    <Link href={`/ptests/${slug}`} className={`${variant === "big" ? "w-full max-w-xl" : "w-[48%]"} group`}>
      <Card className={`cursor-pointer transition-all duration-300 border hover:border-yellow-300 ${variant === "big" ? "flex-col gap-4" : "flex-row items-center gap-6 w-full"} bg-transparent shadow-none`}>
        <div className={`relative ${variant === "big" ? "w-full h-56" : "h-24 w-24 min-w-[6rem] min-h-[6rem]"} bg-gray-100 rounded-xl overflow-hidden`}>
          <Image
            src={imageUrl}
            alt={hr}
            fill
            className="object-cover"
          />
        </div>
        <CardHeader className={`pt-0 ${variant === "big" ? "pb-2 px-6" : "pb-2 px-4 flex-1"}`}>
          <CardTitle className={`font-extrabold text-primary ${variant === "big" ? "text-lg sm:text-2xl mb-1" : "text-base sm:text-lg"}`}>{hr}</CardTitle>
          <CardDescription className={`${variant === "big" ? "text-xs sm:text-base" : "text-xs sm:text-sm"} line-clamp-3`}>{displayDesc}
            {isLong && !showFull && (
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
            {isLong && showFull && (
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
        </CardHeader>
        <CardContent className={`flex flex-row items-center justify-between ${variant === "big" ? "px-6 pb-2 pt-0" : "px-4 pb-2 pt-0"}`}>
          {typeof price === 'number' && (
            <span className="text-xl font-bold text-blue-700">₮{price}</span>
          )}
          {variant === 'small' && (
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-yellow-500 transition ml-2" />
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default TestCards;
export const LazyTestCards = React.lazy(() => import('./TestCards'));
