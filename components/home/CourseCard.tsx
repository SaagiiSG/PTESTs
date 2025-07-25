import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

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
    <Link href={`/Course/${_id}`} className={`block w-full group ${compact ? '' : ''}`}>
      <Card className={`transition-transform hover:scale-[1.03] cursor-pointer py-0 bg-transparent shadow-none border-0 border hover:border-yellow-300 ${compact ? 'rounded-lg' : 'rounded-xl'}`}>
        <div className={`relative w-full ${compact ? 'h-28' : 'h-40'} bg-muted ${compact ? 'rounded-lg' : 'rounded-xl'} overflow-hidden`}>
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        </div>
        <CardHeader className={`pb-2 pt-0 ${compact ? 'px-3' : 'px-4'}`}>
          <CardTitle className={`${compact ? 'text-base' : 'text-lg'} line-clamp-1`}>{title}</CardTitle>
          <CardDescription className={`line-clamp-2 ${compact ? 'text-xs' : ''}`}>{description}</CardDescription>
          {/* Subtle lesson list */}
          {lessons && lessons.length > 0 ? (
            <div className="mt-1">
              <h3 className="text-xs font-semibold text-muted-foreground mb-0.5">Lessons:</h3>
              <ul className="flex flex-col gap-0.5">
                {(compact ? lessons.slice(0, 2) : lessons).map((lesson, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-1 h-1 bg-muted-foreground rounded-full inline-block" />
                    <span className="font-medium line-clamp-1">{lesson.title}</span>
                  </li>
                ))}
                {compact && lessons.length > 2 && (
                  <li className="text-xs text-gray-400">+{lessons.length - 2} more lessons</li>
                )}
              </ul>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground mt-1 block">Lessons: {lessonCount}</span>
          )}
        </CardHeader>
        <CardContent className={`flex flex-row items-center justify-between ${compact ? 'px-3 pb-2 pt-0' : 'px-4 pb-2 pt-0'}`}>
          {/* Remove lessonCount here, now shown above */}
          {typeof price === 'number' && (
            <span className="text-sm font-semibold text-blue-700">
e{price}</span>
          )}
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-yellow-500 transition ml-2" />
        </CardContent>
      </Card>
    </Link>
  );
};

export default CourseCard; 