import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectMongoose } from "@/lib/mongodb";
import Purchase from "@/app/models/purchase";
import Course from "@/app/models/course";
import Test from "@/app/models/tests";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json([], { status: 401 });
  }
  await connectMongoose();
  const url = new URL(req.url || '', 'http://localhost');
  const type = url.searchParams.get('type');
  let purchases = [];
  if (type === 'test') {
    purchases = await Purchase.find({ user: session.user.id, test: { $exists: true } }).sort({ purchasedAt: -1 }).lean();
    // Attach test title
    const testIds = purchases.map(p => p.test);
    const tests = await Test.find({ _id: { $in: testIds } }).lean();
    const testMap = Object.fromEntries(tests.map(t => [t._id.toString(), t.title]));
    return NextResponse.json(purchases.map(p => ({
      _id: p._id,
      testTitle: testMap[p.test?.toString()] || 'Unknown Test',
      purchasedAt: p.purchasedAt,
    })));
  } else if (type === 'course') {
    purchases = await Purchase.find({ user: session.user.id, course: { $exists: true } }).sort({ purchasedAt: -1 }).lean();
    // Attach course title and thumbnailUrl
    const courseIds = purchases.map(p => p.course);
    const courses = await Course.find({ _id: { $in: courseIds } }).lean();
    const courseMap = Object.fromEntries(courses.map(c => [c._id.toString(), { title: c.title, thumbnailUrl: c.thumbnailUrl }]));
    return NextResponse.json(purchases.map(p => ({
      _id: p._id,
      courseId: p.course?.toString(),
      courseTitle: courseMap[p.course?.toString()]?.title || 'Unknown Course',
      thumbnailUrl: courseMap[p.course?.toString()]?.thumbnailUrl || null,
      purchasedAt: p.purchasedAt,
    })));
  }
  return NextResponse.json([]);
} 