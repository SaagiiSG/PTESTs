import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLocalizedTitle(title: any, language: 'en' | 'mn' = 'en'): string {
  if (typeof title === 'string') {
    return title; // Fallback for old data structure
  }
  
  if (title && typeof title === 'object') {
    return title[language] || title.en || title.mn || 'Untitled';
  }
  
  return 'Untitled';
}
