import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import Purchase from "@/app/models/purchase";
import Course from "@/app/models/course";
import Test from "@/app/models/tests";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { message: "Not logged in." },
      { status: 401 }
    );
  }
  await connectMongoose();
  // Find the most recent course purchase for this user
  const coursePurchase = await Purchase.findOne({ user: session.user.id, course: { $exists: true } })
    .sort({ purchasedAt: -1 })
    .lean();
  // Find the most recent test purchase for this user
  const testPurchase = await Purchase.findOne({ user: session.user.id, test: { $exists: true } })
    .sort({ purchasedAt: -1 })
    .lean();
  let course = null;
  let test = null;
  if (coursePurchase) {
    course = await Course.findById(coursePurchase.course).lean();
  }
  if (testPurchase) {
    test = await Test.findById(testPurchase.test).lean();
  }
  return NextResponse.json({ course, test });
} 