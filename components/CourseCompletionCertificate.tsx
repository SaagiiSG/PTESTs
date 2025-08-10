import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface CourseCompletionCertificateProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  courseDescription: string;
  totalLessons: number;
  completedLessons: number;
  userEmail?: string;
  userPhoneNumber?: string;
}

const CourseCompletionCertificate: React.FC<CourseCompletionCertificateProps> = ({
  isOpen,
  onClose,
  courseId,
  courseName,
  courseDescription,
  totalLessons,
  completedLessons,
  userEmail,
  userPhoneNumber
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
          <CardTitle className="text-center text-2xl font-bold">
            🎉 Course Completed! 🎉
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6 bg-white">
          {/* Simple Completion Message */}
          <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <h2 className="text-xl font-semibold text-green-800 mb-3">
              Successfully completed the course!
            </h2>
            <div className="space-y-2 text-gray-700">
              <p className="font-medium">{courseName}</p>
              <p className="text-sm">{courseDescription}</p>
              <p className="text-sm">
                <Badge variant="secondary" className="mr-2">
                  {totalLessons} lessons
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {completedLessons} completed
                </Badge>
              </p>
            </div>
          </div>

          {/* Home Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => {
                onClose();
                router.push('/home');
              }}
              className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
            >
              🏠 Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseCompletionCertificate;
