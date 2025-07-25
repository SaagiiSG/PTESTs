import { NextResponse } from "next/server";
import Test from "@/app/models/tests";
import { connectMongoose } from "@/lib/mongodb";

export async function GET() {
  console.log("GET /api/protected-tests called");
  try {
    console.log("Connecting to MongoDB...");
    await connectMongoose();
    console.log("Fetching tests...");
    const tests = await Test.find().lean();
    console.log("Tests found:", tests.length);
    // Map _id to id and exclude embedCode
    const publicTests = tests.map(({ _id, embedCode, ...rest }) => ({
      id: _id.toString(),
      ...rest,
    }));
    console.log("Returning public tests:", publicTests);
    return NextResponse.json(publicTests);
  } catch (error) {
    console.error("Error in /api/protected-tests:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}