import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, GraduationCap, Clock, DollarSign, Play } from 'lucide-react';

interface Lesson {
  title: string;
  description?: string;
}

interface CourseCardProps {
  _id: string;
  title: string;
  description: string;
  lessonCount: number;
  price?: number;
  thumbnailUrl?: string;
  lessons?: Lesson[];
  compact?: boolean;
  variant?: 'default' | 'sidebar';
  href?: string;
  className?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ _id, title, description, lessonCount, price, thumbnailUrl, lessons, compact, variant = 'default', href, className = '' }) => {
  const imageUrl = thumbnailUrl || "/ppnim_logo.svg";
  const isLocalImage = imageUrl.startsWith('/') && !imageUrl.startsWith('//');
  
  // Debug logging
  React.useEffect(() => {
    if (thumbnailUrl) {
      console.log(`🖼️ CourseCard "${title}":`, { thumbnailUrl, imageUrl, isLocalImage });
    }
  }, [thumbnailUrl, title, imageUrl, isLocalImage]);
  
  const imageHeightCls = compact ? 'h-32' : (variant === 'sidebar' ? 'h-36' : 'h-48');

  return (
    <Link href={href || `/Course/${_id}`} className={`block w-full group ${className}`}>
      <Card className="overflow-hidden group cursor-pointer card-hover border-0 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
        {/* Image Section */}
        <div className={`relative w-full ${imageHeightCls} bg-gray-100 dark:bg-gray-700 overflow-hidden`}>
          {isLocalImage ? (
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <Image 
              src={imageUrl} 
              alt={title} 
              fill 
              className="object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-6 h-6 text-blue-600 dark:text-blue-400 ml-1" fill="currentColor" />
            </div>
          </div>
          
          {/* Price badge (hidden in sidebar variant) */}
          {variant !== 'sidebar' && typeof price === 'number' && (
            <div className="absolute top-3 right-3 transform sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-300">
              <Badge className="bg-white/95 dark:bg-gray-800/95 text-gray-900 dark:text-white font-semibold px-3 py-1 shadow-lg">
                <DollarSign className="w-3 h-3 mr-1" />
                {price}
              </Badge>
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className={`p-4 ${variant === 'sidebar' ? 'pt-3 pb-4' : ''}`}>
          {/* Title */}
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {title}
          </CardTitle>
          
          {/* Description */}
          <CardDescription className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
            {description}
          </CardDescription>

          {/* Lessons Preview */}
          {lessons && lessons.length > 0 ? (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Course Content</span>
              </div>
              <div className="space-y-1">
                {(compact ? lessons.slice(0, 3) : lessons.slice(0, 4)).map((lesson, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                    <span className="line-clamp-1">{lesson.title}</span>
                  </div>
                ))}
                {compact && lessons.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-500 italic">
                    +{lessons.length - 3} more lessons
                  </div>
                )}
                {!compact && lessons.length > 4 && (
                  <div className="text-xs text-gray-500 dark:text-gray-500 italic">
                    +{lessons.length - 4} more lessons
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                {lessonCount} lessons
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              <span>Self-paced</span>
            </div>
            {variant === 'sidebar' ? (
              <div className="flex items-center">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm rounded-full border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/40 font-medium">
                  <Play className="w-4 h-4" />
                  Continue
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <span className="text-xs font-medium">Start Learning</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CourseCard; 