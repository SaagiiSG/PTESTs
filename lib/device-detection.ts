'use client';

import React from 'react';

// Device detection utility
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') {
    return false; // Default to desktop on server-side
  }

  // Check user agent
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android', 'iphone', 'ipad', 'ipod', 'blackberry', 
    'windows phone', 'mobile', 'tablet'
  ];

  const isMobileByUserAgent = mobileKeywords.some(keyword => 
    userAgent.includes(keyword)
  );

  // Check screen size as backup
  const isMobileByScreen = window.innerWidth <= 768;

  return isMobileByUserAgent || isMobileByScreen;
}

// Hook for React components
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setIsMobile(isMobileDevice());
    
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}
