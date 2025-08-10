"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Brain, 
  Stethoscope, 
  User, 
  Play, 
  TrendingUp,
  Award,
  Zap,
  Heart,
  Eye,
  Timer,
  ArrowRight,
  Lock,
  CreditCard,
  Gift
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import PaymentOptionsModal from './PaymentOptionsModal';
import { toast } from 'sonner';

interface TestCardProps {
  _id: string;
  title: string;
  description?: { en: string; mn: string } | string;
  slug?: string;
  thumbnailUrl?: string;
  variant: "featured" | "big" | "small" | "compact" | "grid";
  price?: number;
  takenCount?: number;
  questionCount?: number;
  testType?: 'Talent' | 'Aptitude' | 'Clinic' | 'Personality';
  duration?: number; // in minutes
  hasAccess?: boolean; // New prop to check if user has access

  rating?: number;
  isNew?: boolean;
  isPopular?: boolean;
  isRecommended?: boolean;
  className?: string;
}

const MAX_DESC_LENGTH = 120;

const TestCard: React.FC<TestCardProps> = ({ 
  _id,
  title, 
  description, 
  slug = _id,
  variant = "big",
  thumbnailUrl, 
  price, 
  takenCount, 
  questionCount, 
  testType,
  duration = 20,
  hasAccess = false,

  rating = 4.5,
  isNew = false,
  isPopular = false,
  isRecommended = false,
  className = ""
}) => {
  const [showFull, setShowFull] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { data: session } = useSession();
  
  const imageUrl = thumbnailUrl || "/ppnim_logo.svg";
  const isLocalImage = imageUrl.startsWith('/') && !imageUrl.startsWith('//');
  
  // Handle description
  const descText = typeof description === 'string' 
    ? description 
    : description?.en || description?.mn || 'No description available';
  const isLong = descText.length > MAX_DESC_LENGTH;
  const displayDesc = showFull || !isLong ? descText : descText.slice(0, MAX_DESC_LENGTH) + '...';

  // Test type configuration
  const getTestTypeInfo = (type?: string) => {
    switch (type) {
      case 'Talent':
        return { 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Talent',
          icon: Star,
          gradient: 'from-blue-500 to-blue-600'
        };
      case 'Aptitude':
        return { 
          color: 'text-emerald-600', 
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          label: 'Aptitude',
          icon: Brain,
          gradient: 'from-emerald-500 to-emerald-600'
        };
      case 'Clinic':
        return { 
          color: 'text-purple-600', 
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          label: 'Clinic',
          icon: Stethoscope,
          gradient: 'from-purple-500 to-purple-600'
        };
      case 'Personality':
        return { 
          color: 'text-orange-600', 
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          label: 'Personality',
          icon: User,
          gradient: 'from-orange-500 to-orange-600'
        };
      default:
        return { 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Test',
          icon: BookOpen,
          gradient: 'from-gray-500 to-gray-600'
        };
    }
  };

  const testTypeInfo = getTestTypeInfo(testType);
  const TestTypeIcon = testTypeInfo.icon;

  const handlePaymentSuccess = (paymentData: any, uniqueCode?: string) => {
    if (uniqueCode) {
      toast.success(`Payment successful! Your unique access code: ${uniqueCode}`);
    } else {
      toast.success('Payment successful! You now have access to this test.');
    }
    
    // For free tests, redirect directly to the test start page
    if (price === 0) {
      console.log('Free test purchased, redirecting to test start page:', `/test-embed/${_id}`);
      window.location.href = `/test-embed/${_id}`;
    } else {
      // For paid tests, refresh the page to update the UI
      window.location.reload();
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
  };

  const handleCardClick = async (e: React.MouseEvent) => {
    // For free tests, directly enroll and redirect to test start page
    if (price === 0 && !hasAccess) {
      e.preventDefault();
      if (!session?.user?.id) {
        toast.error('Please log in to enroll in this test');
        return;
      }
      
      try {
        console.log('Directly enrolling in free test:', _id);
        
        const response = await fetch('/api/public/purchase-free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: _id,
            itemType: 'test',
            amount: 0,
            paymentMethod: 'free'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Free enrollment successful:', data);
          
          if (data.uniqueCode) {
            toast.success(`Free test enrolled! Your unique code: ${data.uniqueCode}`);
          } else {
            toast.success('Free test enrolled successfully!');
          }
          
          // Redirect directly to test start page
          window.location.href = `/test-embed/${_id}`;
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          console.error('Free enrollment failed:', errorData);
          
          if (errorData.message === 'Test already purchased.') {
            // If already purchased, just redirect to test start page
            toast.success('You already have access to this test!');
            window.location.href = `/test-embed/${_id}`;
          } else {
            toast.error(errorData.message || 'Failed to enroll in free test');
          }
        }
      } catch (error) {
        console.error('Error enrolling in free test:', error);
        toast.error('Failed to enroll in free test');
      }
      return;
    }
    
    // For paid tests or tests user already has access to, use existing logic
    if (!hasAccess && (price !== undefined && price !== null && price > 0)) {
      e.preventDefault();
      if (!session?.user?.id) {
        toast.error('Please log in to purchase this test');
        return;
      }
      setShowPaymentModal(true);
    }
  };

  // Rating stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  // Card variants - all horizontal layout
  const getCardClasses = () => {
    const baseClasses = "group cursor-pointer transition-all duration-500 overflow-hidden w-full";
    
    switch (variant) {
      case "featured":
        return `${baseClasses} bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-1`;
      case "big":
        return `${baseClasses} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transform hover:-translate-y-1`;
      case "small":
        return `${baseClasses} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md`;
      case "compact":
        return `${baseClasses} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md`;
      case "grid":
        return `${baseClasses} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transform hover:-translate-y-1`;
      default:
        return baseClasses;
    }
  };

  const getImageClasses = () => {
    // Mobile: fixed height; Desktop: rely on flex stretch (no explicit height), keep a sensible min-height
    const baseClasses = "relative overflow-hidden flex-shrink-0 w-full";

    switch (variant) {
      case "featured":
        return `${baseClasses} h-40 sm:w-80 sm:h-auto sm:min-h-[12rem] sm:self-stretch`;
      case "big":
        return `${baseClasses} h-36 sm:w-64 sm:h-auto sm:min-h-[10rem] sm:self-stretch`;
      case "small":
        return `${baseClasses} h-28 sm:w-32 sm:h-auto sm:min-h-[6rem] sm:self-stretch`;
      case "compact":
        return `${baseClasses} h-24 sm:w-24 sm:h-auto sm:min-h-[5rem] sm:self-stretch`;
      case "grid":
        return `${baseClasses} h-36 sm:w-56 sm:h-auto sm:min-h-[9rem] sm:self-stretch`;
      default:
        return `${baseClasses} h-36 sm:w-64 sm:h-auto sm:min-h-[10rem] sm:self-stretch`;
    }
  };

  const getContentClasses = () => {
    switch (variant) {
      case "small":
      case "compact":
        return "flex-1 p-3";
      default:
        return "flex-1 p-6";
    }
  };

  return (
    <>
      <div className={`block w-full ${className}`} onClick={handleCardClick}>
        <Card 
          className={`${getCardClasses()}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex flex-col sm:flex-row items-stretch h-full overflow-visible">
            {/* Image Section - Left Side */}
            <div className={`${getImageClasses()} sm:flex sm:items-stretch sm:self-stretch`}>
              {isLocalImage ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-700"
                />
              )}
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="bg-white/95 dark:bg-gray-800/95 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-500 shadow-lg">
                  {hasAccess ? (
                    <Play className="w-5 h-5 text-blue-600 dark:text-blue-400 ml-0.5" fill="currentColor" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* Special badges for featured variant */}
              {variant === "featured" && (
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                  {isNew && (
                    <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 animate-pulse">
                      <Zap className="w-3 h-3 mr-1" />
                      New
                    </Badge>
                  )}
                  {isPopular && (
                    <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {isRecommended && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-2 py-1">
                      <Award className="w-3 h-3 mr-1" />
                      Recommended
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Content Section - Right Side */}
            <div className={`${getContentClasses()} sm:flex sm:flex-col sm:self-stretch`}>
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className={`font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 ${
                      variant === "featured" ? "text-xl" :
                      variant === "big" ? "text-lg" :
                      variant === "small" ? "text-sm" :
                      variant === "compact" ? "text-xs" :
                      "text-base"
                    }`}>
                      {title}
                    </CardTitle>
                  </div>
                  
                  {/* Price badge */}
                  {typeof price === 'number' && (
                    <div className="flex-shrink-0">
                      <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold px-3 py-1.5 shadow-lg">
                        ₮{price}
                      </Badge>
                    </div>
                  )}
                </div>
                
                {/* Description */}
                {(variant === "featured" || variant === "big" || variant === "grid") && (
                  <CardDescription className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300 text-sm">
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
                )}

                {/* Stats and Info */}
                <div className="flex-1 flex flex-col justify-between">
                  {/* Primary stats */}
                  <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-sm mb-3">
                    {questionCount && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{questionCount} questions</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{duration} min</span>
                    </div>
                    {takenCount && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{takenCount} taken</span>
                      </div>
                    )}
                  </div>

                  {/* Secondary info and badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Test Type Badge */}
                      {testType && (
                        <Badge className={`${testTypeInfo.bgColor} ${testTypeInfo.color} border ${testTypeInfo.borderColor} font-medium px-3 py-1.5 text-xs flex items-center gap-1.5`}>
                          <TestTypeIcon className="w-3 h-3" />
                          {testTypeInfo.label}
                        </Badge>
                      )}
                      
                      {/* Access Status Badge */}
                      {price && (
                        <Badge className={`font-medium px-3 py-1.5 text-xs flex items-center gap-1.5 ${
                          hasAccess || price === 0
                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' 
                            : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                        }`}>
                          {hasAccess ? (
                            <>
                              <Play className="w-3 h-3" />
                              Available
                            </>
                          ) : price === 0 ? (
                            <>
                              <Gift className="w-3 h-3" />
                              Free
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              Locked
                            </>
                          )}
                        </Badge>
                      )}
                      
                      {/* Rating */}
                      {(variant === "featured" || variant === "big") && (
                        <div className="flex items-center gap-1">
                          {renderStars(rating)}
                          <span className="text-xs text-gray-500 ml-1">({rating})</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action button for featured variant */}
                    {variant === "featured" && (
                      <Button 
                        className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 transform group-hover:scale-105 ${
                          hasAccess || price === 0
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white' 
                            : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white'
                        }`}
                      >
                        {hasAccess ? (
                          <>
                            Start Test
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </>
                        ) : price === 0 ? (
                          <>
                            Start Test
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Purchase
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Options Modal */}
      <PaymentOptionsModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        itemId={_id}
        itemType="test"
        itemTitle={title}
        itemDescription={descText}
        price={price || 0}
        thumbnailUrl={thumbnailUrl}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </>
  );
};

export default TestCard;
