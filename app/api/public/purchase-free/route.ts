import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import User from "@/app/models/user";
import Course from "@/app/models/course";
import Test from "@/app/models/tests";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Not logged in." }, { status: 401 });
    }
    
    const { itemId, itemType, amount } = await req.json();
    console.log('Free purchase request:', { itemId, itemType, amount, userId: session.user.id });
    
    if (!itemId || !itemType) {
      return NextResponse.json({ message: "Missing itemId or itemType." }, { status: 400 });
    }
    
    if (amount !== 0) {
      return NextResponse.json({ message: "This endpoint is only for free items (amount = 0)." }, { status: 400 });
    }
    
    await connectMongoose();
    const user = await User.findById(session.user.id);
    if (!user) {
      console.error('User not found:', session.user.id);
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    
    if (itemType === 'course') {
      const course = await Course.findById(itemId);
      if (!course) {
        return NextResponse.json({ message: "Course not found." }, { status: 404 });
      }
      
      if (user.purchasedCourses.includes(itemId)) {
        return NextResponse.json({ message: "Course already purchased." }, { status: 409 });
      }
      
      user.purchasedCourses.push(itemId);
      await user.save();
      
      console.log(`Free course purchase recorded: ${itemId} for user ${session.user.id}`);
      
      return NextResponse.json({ 
        message: "Free course enrolled successfully.",
        courseId: itemId,
        amount: 0
      });
    }
    
    if (itemType === 'test') {
      const test = await Test.findById(itemId);
      if (!test) {
        return NextResponse.json({ message: "Test not found." }, { status: 404 });
      }
      
      if (user.purchasedTests.includes(itemId)) {
        return NextResponse.json({ message: "Test already purchased." }, { status: 409 });
      }
      
      // Find an unused unique code for the test
      let uniqueCode = null;
      if (test.uniqueCodes && test.uniqueCodes.length > 0) {
        const availableCode = test.uniqueCodes.find((code: any) => !code.used);
        if (availableCode) {
          // Assign the code to the user
          availableCode.used = true;
          availableCode.assignedTo = user._id;
          availableCode.assignedAt = new Date();
          uniqueCode = availableCode.code;
          
          // Save the test to update the code status
          await test.save();
          console.log(`Unique code ${uniqueCode} assigned to user ${session.user.id} for test ${itemId}`);
        } else {
          console.warn(`No available unique codes for test ${itemId}`);
        }
      }
      
      // Add test to user's purchased tests
      user.purchasedTests.push(itemId);
      await user.save();
      
      console.log(`Free test purchase recorded: ${itemId} for user ${session.user.id}`);
      
      return NextResponse.json({ 
        message: "Free test enrolled successfully.",
        testId: itemId,
        amount: 0,
        uniqueCode: uniqueCode
      });
    }
    
    return NextResponse.json({ message: "Invalid item type." }, { status: 400 });
    
  } catch (error) {
    console.error('Free purchase error:', error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
} 