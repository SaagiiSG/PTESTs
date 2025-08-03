"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, BookOpen, Clock, Users, Star, Brain, Stethoscope, User, Play } from 'lucide-react';

interface TestcardsProps {
  hr: string;
  shortDes: string;
  slug: string;
  thumbnailUrl?: string;
  variant: "big" | "small";
  price?: number;
  takenCount?: number;
  questionCount?: number;
  testType?: 'Talent' | 'Aptitude' | 'Clinic' | 'Personality';
}

const MAX_DESC_LENGTH = 100;

const TestCards = ({ hr, shortDes, slug, variant, thumbnailUrl, price, takenCount, questionCount, testType }: TestcardsProps) => {
  const [showFull, setShowFull] = useState(false);
  const her: string = hr;
  const shortDescription: string = shortDes;
  const imageUrl = thumbnailUrl || "/ppnim_logo.svg";
  const isLocalImage = imageUrl.startsWith('/') && !imageUrl.startsWith('//');
  const isLong = shortDescription.length > MAX_DESC_LENGTH;
  const displayDesc = showFull || !isLong ? shortDescription : shortDescription.slice(0, MAX_DESC_LENGTH) + '...';

  // Test type colors, labels, and icons
  const getTestTypeInfo = (type?: string) => {
    switch (type) {
      case 'Talent':
        return { 
          color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white', 
          label: 'Talent / Талант',
          icon: Star
        };
      case 'Aptitude':
        return { 
          color: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white', 
          label: 'Aptitude / Ур чадвар',
          icon: Brain
        };
      case 'Clinic':
        return { 
          color: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white', 
          label: 'Clinic / Клиник',
          icon: Stethoscope
        };
      case 'Personality':
        return { 
          color: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white', 
          label: 'Personality / Төрх байдал',
          icon: User
        };
      default:
        return { 
          color: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white', 
          label: 'Test',
          icon: BookOpen
        };
    }
  };

  const testTypeInfo = getTestTypeInfo(testType);
  const TestTypeIcon = testTypeInfo.icon;

  return (
    <Link href={`/ptests/${slug}`} className={`${variant === "big" ? "w-full max-w-xl" : "w-[48%]"} group`}>
      <Card className={`overflow-hidden group cursor-pointer card-hover border-0 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 ${variant === "big" ? "flex-col" : "flex-row items-stretch"}`}>
        {/* Image Section */}
        <div className={`relative ${variant === "big" ? "w-full h-56" : "w-20 h-20 flex-shrink-0"} bg-gray-100 dark:bg-gray-700 overflow-hidden h-full`}>
          {isLocalImage ? (
            <img
              src={imageUrl}
              alt={hr}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <Image
              src={imageUrl}
              alt={hr}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110 h-full"
            />
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play button overlay - only for big variant */}
          {variant === "big" && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                <Play className="w-6 h-6 text-blue-600 dark:text-blue-400 ml-1" fill="currentColor" />
              </div>
            </div>
          )}
          
          {/* Test Type Badge - top left */}
          {testType && (
            <div className="absolute top-3 left-3 transform -translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <Badge className={`${testTypeInfo.color} font-medium px-3 py-1.5 text-xs shadow-lg flex items-center gap-1.5`}>
                <TestTypeIcon className="w-3 h-3" />
                {testTypeInfo.label}
              </Badge>
            </div>
          )}
          
          {/* Price badge - only show on big variant */}
          {variant === "big" && typeof price === 'number' && (
            <div className="absolute top-3 right-3 transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <Badge className="bg-white/95 dark:bg-gray-800/95 text-gray-900 dark:text-white font-semibold px-3 py-1 shadow-lg">
                ₮{price}
              </Badge>
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className={`p-4 ${variant === "small" ? "flex-1" : ""}`}>
          {/* Title */}
          <CardTitle className={`font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 ${
            variant === "big" ? "text-lg" : "text-sm"
          }`}>
            {her}
          </CardTitle>
          
          {/* Description */}
          <CardDescription className={`text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300 ${
            variant === "big" ? "text-sm" : "text-xs"
          }`}>
            {displayDesc}
            {isLong && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowFull(!showFull);
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline ml-1 font-medium"
              >
                {showFull ? 'Show less' : 'Show more'}
              </button>
            )}
          </CardDescription>

          {/* Stats */}
          <div className={`flex items-center gap-4 text-gray-500 dark:text-gray-400 ${
            variant === "big" ? "text-sm" : "text-xs"
          }`}>
            {questionCount && (
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>{questionCount} questions</span>
              </div>
            )}
            {takenCount && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{takenCount} taken</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>15-20 min</span>
            </div>
          </div>

          {/* Footer - only for big variant */}
          {variant === "big" && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 mt-3">
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <span className="text-sm font-medium">Start Test</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default TestCards;
export const LazyTestCards = React.lazy(() => import('./TestCards'));
