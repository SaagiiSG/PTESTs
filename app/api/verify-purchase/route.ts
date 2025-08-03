import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import User from "@/app/models/user";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ 
        hasAccess: false, 
        message: "Not authenticated." 
      }, { status: 401 });
    }
    
    const { courseId, testId } = await req.json();
    
    if (!courseId && !testId) {
      return NextResponse.json({ 
        hasAccess: false, 
        message: "Missing courseId or testId." 
      }, { status: 400 });
    }
    
    await connectMongoose();
    const user = await User.findById(session.user.id).populate('purchasedCourses purchasedTests');
    
    if (!user) {
      return NextResponse.json({ 
        hasAccess: false, 
        message: "User not found." 
      }, { status: 404 });
    }
    
    let hasAccess = false;
    let purchaseType = '';
    let uniqueCode = null;
    
    if (courseId) {
      // Check if user has purchased this course
      hasAccess = user.purchasedCourses?.some((course: any) => 
        course._id?.toString() === courseId || course.toString() === courseId
      ) || false;
      purchaseType = 'course';
    }
    
    if (testId) {
      // Check if user has purchased this test
      hasAccess = user.purchasedTests?.some((test: any) => 
        test._id?.toString() === testId || test.toString() === testId
      ) || false;
      purchaseType = 'test';
      
      // If user has access, get their unique code
      if (hasAccess) {
        const Test = (await import('@/app/models/tests')).default;
        const test = await Test.findById(testId);
        if (test && test.uniqueCodes) {
          const userCode = test.uniqueCodes.find((code: any) => 
            code.assignedTo?.toString() === user._id.toString()
          );
          if (userCode) {
            uniqueCode = userCode.code;
          }
        }
      }
    }
    
    return NextResponse.json({
      hasAccess,
      purchaseType,
      uniqueCode,
      message: hasAccess ? "Access granted." : "Purchase required."
    });
    
  } catch (error) {
    console.error('Purchase verification error:', error);
    return NextResponse.json({ 
      hasAccess: false, 
      message: "Internal server error." 
    }, { status: 500 });
  }
} 