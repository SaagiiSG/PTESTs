import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, GraduationCap, Clock, DollarSign } from 'lucide-react';

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
}

const CourseCard: React.FC<CourseCardProps> = ({ _id, title, description, lessonCount, price, thumbnailUrl, lessons, compact }) => {
  const imageUrl = thumbnailUrl || "/ppnim_logo.svg";
  
  return (
    <Link href={`/Course/${_id}`} className="block w-full group">
      <Card className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-0 shadow-sm bg-white">
        {/* Image Section */}
        <div className={`relative w-full ${compact ? 'h-32' : 'h-48'} bg-gray-100 overflow-hidden`}>
          <Image 
            src={imageUrl} 
            alt={title} 
            fill 
            className="object-cover transition-transform duration-300 group-hover:scale-105" 
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Price badge */}
          {typeof price === 'number' && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-white/90 text-gray-900 font-semibold px-3 py-1">
                <DollarSign className="w-3 h-3 mr-1" />
                {price}
              </Badge>
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="p-4">
          {/* Title */}
          <CardTitle className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {title}
          </CardTitle>
          
          {/* Description */}
          <CardDescription className="text-sm text-gray-600 mb-3 line-clamp-2">
            {description}
          </CardDescription>

          {/* Lessons Preview */}
          {lessons && lessons.length > 0 ? (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-gray-700">Course Content</span>
              </div>
              <div className="space-y-1">
                {(compact ? lessons.slice(0, 3) : lessons.slice(0, 4)).map((lesson, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                    <span className="line-clamp-1">{lesson.title}</span>
                  </div>
                ))}
                {compact && lessons.length > 3 && (
                  <div className="text-xs text-gray-500 italic">
                    +{lessons.length - 3} more lessons
                  </div>
                )}
                {!compact && lessons.length > 4 && (
                  <div className="text-xs text-gray-500 italic">
                    +{lessons.length - 4} more lessons
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">{lessonCount} lessons</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{lessonCount} lessons</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600 group-hover:text-blue-700 transition-colors">
              <span className="text-sm font-medium">View Course</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CourseCard; 