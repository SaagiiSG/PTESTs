import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import User from "@/app/models/user";
import Course from "@/app/models/course";
import Test from "@/app/models/tests";
import Purchase from "@/app/models/purchase";
import { auth } from "@/auth";
import { getPaymentStatus } from "@/lib/payment-storage";
import Payment from "@/app/models/payment";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Not logged in." }, { status: 401 });
    }
    
    const { courseId, testId, itemId, itemType, amount, paymentId, paymentData } = await req.json();
    console.log('Purchase request:', { courseId, testId, itemId, itemType, amount, paymentId, userId: session.user.id });
    
    // Support both old format (courseId/testId) and new format (itemId/itemType)
    let finalCourseId = courseId;
    let finalTestId = testId;
    
    if (itemId && itemType) {
      if (itemType === 'course') {
        finalCourseId = itemId;
      } else if (itemType === 'test') {
        finalTestId = itemId;
      }
    }
    
    if (!finalCourseId && !finalTestId) {
      return NextResponse.json({ message: "Missing courseId or testId." }, { status: 400 });
    }
    
    // Verify payment if paymentId is provided
    if (paymentId) {
      console.log('Verifying payment:', paymentId);
      
      // Check if payment status is stored (from callback)
      // Note: paymentId is the invoice_id, which is stored as object_id in the payment storage
      let paymentInfo = await getPaymentStatus(paymentId);
      
      if (!paymentInfo) {
        console.log('Payment not found in local storage. This could be a timing issue.');
        console.log('Payment might still be processing. Please wait a moment and try again.');
        
        return NextResponse.json({ 
          message: "Payment verification in progress. Please wait a moment and try again, or check your payment status.",
          code: "PAYMENT_PROCESSING"
        }, { status: 202 }); // 202 Accepted - processing
      }
      
      if (paymentInfo.payment_status !== 'PAID') {
        console.error('Payment not completed:', paymentInfo.payment_status);
        return NextResponse.json({ 
          message: "Payment not completed. Please complete the payment first.",
          status: paymentInfo.payment_status
        }, { status: 402 });
      }
      
      console.log('Payment verified successfully:', paymentInfo);
    }
    
    await connectMongoose();
    const user = await User.findById(session.user.id);
    if (!user) {
      console.error('User not found:', session.user.id);
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    
    if (finalCourseId) {
      const course = await Course.findById(finalCourseId);
      if (!course) {
        return NextResponse.json({ message: "Course not found." }, { status: 404 });
      }
      
      if (user.purchasedCourses.includes(finalCourseId)) {
        console.log(`Course already purchased by user ${session.user.id}: ${finalCourseId}`);
        return NextResponse.json({ 
          message: "Course already purchased.",
          alreadyPurchased: true,
          courseId: finalCourseId
        }, { status: 200 }); // Return 200 instead of 409 for already purchased
      }
      
      // Update user model (fast access)
      user.purchasedCourses.push(finalCourseId);
      await user.save();
      
      // Create purchase record (analytics and history)
      await Purchase.create({
        user: session.user.id,
        course: finalCourseId,
        purchasedAt: new Date()
      });
      
      console.log(`Course purchase recorded: ${finalCourseId} for user ${session.user.id}`);
      
      return NextResponse.json({ 
        message: "Course purchased successfully.",
        courseId: finalCourseId,
        amount: amount || course.price
      });
    }
    
    if (finalTestId) {
      const test = await Test.findById(finalTestId);
      if (!test) {
        return NextResponse.json({ message: "Test not found." }, { status: 404 });
      }
      
      if (user.purchasedTests.includes(finalTestId)) {
        console.log(`Test already purchased by user ${session.user.id}: ${finalTestId}`);
        return NextResponse.json({ 
          message: "Test already purchased.",
          alreadyPurchased: true,
          testId: finalTestId
        }, { status: 200 }); // Return 200 instead of 409 for already purchased
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
          console.log(`Unique code ${uniqueCode} assigned to user ${session.user.id} for test ${finalTestId}`);
        } else {
          console.warn(`No available unique codes for test ${finalTestId}`);
        }
      }
      
      // Update user model (fast access)
      user.purchasedTests.push(finalTestId);
      await user.save();
      
      // Create purchase record (analytics and history)
      await Purchase.create({
        user: session.user.id,
        test: finalTestId,
        purchasedAt: new Date()
      });
      
      console.log(`Test purchase recorded: ${finalTestId} for user ${session.user.id}`);
      
      return NextResponse.json({ 
        message: "Test purchased successfully.",
        testId: finalTestId,
        amount: amount || test.price,
        uniqueCode: uniqueCode
      });
    }
    
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
} 