"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbsProps {
  courseName?: string;
  lessonName?: string;
}

export default function Breadcrumbs({ courseName, lessonName }: BreadcrumbsProps = {}) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  let path = "";

  // Map for custom labels
  const customLabels = segments.map((segment, idx) => {
    // Detect courseId and lessonIdx positions
    if (segments[idx - 1] === 'Course') {
      return courseName || segment;
    }
    // Fix: If this is the last segment and path is /Course/[courseId]/lesson/[lessonIdx], use lessonName
    if (
      idx === segments.length - 1 &&
      segments.length >= 4 &&
      segments[0] === 'Course' &&
      segments[2] === 'lesson'
    ) {
      return lessonName || segment;
    }
    if (segments[idx - 2] === 'Course' && segments[idx - 1] === 'lesson') {
      return lessonName || segment;
    }
    // Capitalize for known static segments
    if (segment === 'Course') return 'Courses';
    if (segment === 'lesson') return 'Lesson';
    return decodeURIComponent(segment);
  });

  // Debugging
  console.log('Breadcrumbs segments:', segments);
  console.log('Breadcrumbs customLabels:', customLabels);

  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      <Link href="/home" className="flex items-center gap-1 text-gray-500 hover:text-yellow-500 transition-colors">
        <Home className="w-4 h-4" />
        Home
      </Link>
      {segments.map((segment, idx) => {
        path += `/${segment}`;
        const isLast = idx === segments.length - 1;
        return (
          <span key={path} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {isLast ? (
              <span className="text-gray-700 capitalize">{customLabels[idx]}</span>
            ) : (
              <Link href={path} className="text-gray-500 hover:text-yellow-500 capitalize transition-colors">{customLabels[idx]}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
} 