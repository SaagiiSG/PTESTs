import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  className?: string;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  variant = 'spinner', 
  className,
  text 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const renderLoadingVariant = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className={cn("spinner", sizeClasses[size], className)} />
        );
      
      case 'dots':
        return (
          <div className={cn("flex space-x-1", className)}>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "bg-current rounded-full animate-bounce",
                  size === 'sm' ? 'w-1 h-1' : 
                  size === 'md' ? 'w-1.5 h-1.5' :
                  size === 'lg' ? 'w-2 h-2' : 'w-3 h-3'
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div className={cn("animate-pulse", sizeClasses[size], "bg-current rounded-full", className)} />
        );
      
      case 'skeleton':
        return (
          <div className={cn("skeleton rounded", className)} />
        );
      
      default:
        return (
          <div className={cn("spinner", sizeClasses[size], className)} />
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {renderLoadingVariant()}
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export { Loading }; 