import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import User from "@/app/models/user";
import Course from "@/app/models/course";
import Test from "@/app/models/tests";
import Purchase from "@/app/models/purchase";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    console.log('Free purchase API called');
    
    const session = await auth();
    console.log('Session check result:', { 
      hasSession: !!session, 
      hasUser: !!session?.user, 
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id 
    });
    
    if (!session || !session.user || !session.user.id) {
      console.error('Authentication failed: No valid session or user ID');
      return NextResponse.json({ message: "Not logged in." }, { status: 401 });
    }
    
    const { itemId, itemType, amount } = await req.json();
    console.log('Free purchase request:', { itemId, itemType, amount, userId: session.user.id });
    
    if (!itemId || !itemType) {
      console.error('Missing required fields:', { itemId, itemType });
      return NextResponse.json({ message: "Missing itemId or itemType." }, { status: 400 });
    }
    
    if (amount !== 0) {
      console.error('Invalid amount for free purchase:', amount);
      return NextResponse.json({ message: "This endpoint is only for free items (amount = 0)." }, { status: 400 });
    }
    
    console.log('Connecting to MongoDB...');
    await connectMongoose();
    console.log('MongoDB connected successfully');
    
    const user = await User.findById(session.user.id);
    console.log('User lookup result:', { 
      found: !!user, 
      userId: session.user.id,
      userPurchasedTests: user?.purchasedTests?.length || 0,
      userPurchasedCourses: user?.purchasedCourses?.length || 0
    });
    
    if (!user) {
      console.error('User not found:', session.user.id);
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    
    if (itemType === 'course') {
      console.log('Processing course purchase...');
      const course = await Course.findById(itemId);
      console.log('Course lookup result:', { found: !!course, courseId: itemId });
      
      if (!course) {
        console.error('Course not found:', itemId);
        return NextResponse.json({ message: "Course not found." }, { status: 404 });
      }
      
      if (user.purchasedCourses.includes(itemId)) {
        console.log('Course already purchased:', itemId);
        return NextResponse.json({ message: "Course already purchased." }, { status: 409 });
      }
      
      // Update user model (fast access)
      user.purchasedCourses.push(itemId);
      await user.save();
      
      // Create purchase record (analytics and history)
      await Purchase.create({
        user: session.user.id,
        course: itemId,
        purchasedAt: new Date()
      });
      
      console.log(`Free course purchase recorded: ${itemId} for user ${session.user.id}`);
      
      return NextResponse.json({ 
        message: "Free course enrolled successfully.",
        courseId: itemId,
        amount: 0
      });
    }
    
    if (itemType === 'test') {
      console.log('Processing test purchase...');
      const test = await Test.findById(itemId);
      console.log('Test lookup result:', { found: !!test, testId: itemId });
      
      if (!test) {
        console.error('Test not found:', itemId);
        return NextResponse.json({ message: "Test not found." }, { status: 404 });
      }
      
      if (user.purchasedTests.includes(itemId)) {
        console.log('Test already purchased:', itemId);
        return NextResponse.json({ message: "Test already purchased." }, { status: 409 });
      }
      
      // Find an unused unique code for the test
      let uniqueCode = null;
      if (test.uniqueCodes && test.uniqueCodes.length > 0) {
        console.log('Checking for available unique codes...');
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
      } else {
        console.log('No unique codes configured for this test');
      }
      
      // Update user model (fast access)
      user.purchasedTests.push(itemId);
      await user.save();
      
      // Create purchase record (analytics and history)
      await Purchase.create({
        user: session.user.id,
        test: itemId,
        purchasedAt: new Date()
      });
      
      console.log(`Free test purchase recorded: ${itemId} for user ${session.user.id}`);
      
      return NextResponse.json({ 
        message: "Free test enrolled successfully.",
        testId: itemId,
        amount: 0,
        uniqueCode: uniqueCode
      });
    }
    
    console.error('Invalid item type:', itemType);
    return NextResponse.json({ message: "Invalid item type." }, { status: 400 });
    
  } catch (error) {
    console.error('Free purchase error:', error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
} 