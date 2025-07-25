import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import User from "@/app/models/user";
import Course from "@/app/models/course";
import Test from "@/app/models/tests";
import Purchase from "@/app/models/purchase";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Not logged in." }, { status: 401 });
  }
  const { courseId, testId } = await req.json();
  if (!courseId && !testId) {
    return NextResponse.json({ message: "Missing courseId or testId." }, { status: 400 });
  }
  await connectMongoose();
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }
  if (courseId) {
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ message: "Course not found." }, { status: 404 });
    }
    if (!user.purchasedCourses) user.purchasedCourses = [];
    if (!user.purchasedCourses.some((id: any) => id.toString() === courseId)) {
      user.purchasedCourses.push(courseId);
      await user.save();
    }
    await Purchase.create({ user: user._id, course: course._id });
    return NextResponse.json({ message: "Course purchase recorded." });
  }
  if (testId) {
    const test = await Test.findById(testId);
    if (!test) {
      return NextResponse.json({ message: "Test not found." }, { status: 404 });
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
    await Purchase.create({ user: user._id, test: test._id });
    return NextResponse.json({ message: "Test purchase recorded.", code: codeObj.code });
  }
  return NextResponse.json({ message: "Invalid request." }, { status: 400 });
} 