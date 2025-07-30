import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import User from "@/app/models/user";
import Course from "@/app/models/course";
import Test from "@/app/models/tests";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Not logged in." }, { status: 401 });
    }
    
    const { courseId, testId } = await req.json();
    console.log('Purchase request:', { courseId, testId, userId: session.user.id });
    
    if (!courseId && !testId) {
      return NextResponse.json({ message: "Missing courseId or testId." }, { status: 400 });
    }
    
    await connectMongoose();
    const user = await User.findById(session.user.id);
    if (!user) {
      console.error('User not found:', session.user.id);
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        console.error('Course not found:', courseId);
        return NextResponse.json({ message: "Course not found." }, { status: 404 });
      }
      
      // Initialize arrays if they don't exist
      if (!user.purchasedCourses) user.purchasedCourses = [];
      
      // Check if user already purchased this course
      const alreadyPurchased = user.purchasedCourses.some((id: any) => id.toString() === courseId);
      if (alreadyPurchased) {
        console.log('Course already purchased by user:', { courseId, userId: session.user.id });
        return NextResponse.json({ message: "Course already purchased." }, { status: 409 });
      }
      
      // Add course to user's purchased courses
      user.purchasedCourses.push(courseId);
      await user.save();
      console.log('Course added to user purchases:', { courseId, userId: session.user.id });
      
      return NextResponse.json({ message: "Course purchase recorded." });
    }
    
    if (testId) {
      const test = await Test.findById(testId);
      if (!test) {
        console.error('Test not found:', testId);
        return NextResponse.json({ message: "Test not found." }, { status: 404 });
      }
      
      // Initialize arrays if they don't exist
      if (!user.purchasedTests) user.purchasedTests = [];
      
      // Check if user already purchased this test
      const alreadyPurchased = user.purchasedTests.some((id: any) => id.toString() === testId);
      if (alreadyPurchased) {
        console.log('Test already purchased by user:', { testId, userId: session.user.id });
        return NextResponse.json({ message: "Test already purchased." }, { status: 409 });
      }
      
      // Find an unused code
      const codeObj = test.uniqueCodes?.find((c: any) => !c.used);
      if (!codeObj) {
        return NextResponse.json({ message: "No unique codes available for this test." }, { status: 400 });
      }
      
      // Assign code to user
      codeObj.used = true;
      codeObj.assignedTo = user._id;
      codeObj.assignedAt = new Date();
      await test.save();
      
      // Add test to user's purchased tests
      user.purchasedTests.push(testId);
      await user.save();
      console.log('Test added to user purchases:', { testId, userId: session.user.id });
      
      return NextResponse.json({ message: "Test purchase recorded.", code: codeObj.code });
    }
    
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  } catch (error) {
    console.error('Purchase API error:', error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
} 