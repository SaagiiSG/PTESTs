import { NextResponse } from "next/server";
import Test from "@/app/models/tests";
import { connectMongoose } from "@/lib/mongodb";
import { Types } from "mongoose";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  // Log for debugging
  console.log("GET /api/protected-tests/[id] called with ID:", id);

  // Validate id
  if (!id || id === "undefined" || !Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid or missing ID" }, { status: 400 });
  }

  try {
    console.log("Connecting to MongoDB...");
    await connectMongoose();
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