import { NextResponse } from 'next/server';
import Test from "@/app/models/tests";
import { safeConnectMongoose } from '@/lib/mongodb';
import { Types } from "mongoose";

// Force this route to be dynamic only (not executed during build)
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  const { id } = await params;

  // Log for debugging
  console.log("GET /api/protected-tests/[id] called with ID:", id);

  // Validate id
  if (!id || id === "undefined" || !Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid or missing ID" }, { status: 400 });
  }

  try {
    console.log("Connecting to MongoDB...");
    const connection = await safeConnectMongoose();
    if (!connection) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
    console.log("Fetching test with ID:", id);
    
    const test = await Test.findById(id).lean();
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Return test data without embedCode for security
    const { embedCode, ...publicTest } = test as any;
    const result = {
      _id: (test as any)._id.toString(),
      ...publicTest,
    };

    console.log("Returning test:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/protected-tests/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}