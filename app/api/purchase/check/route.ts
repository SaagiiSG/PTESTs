import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import User from "@/app/models/user";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Not logged in." }, { status: 401 });
    }
    
    const { userId, itemId, itemType } = await req.json();
    console.log('Purchase check request:', { userId, itemId, itemType });
    
    if (!userId || !itemId || !itemType) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }
    
    if (itemType !== 'test' && itemType !== 'course') {
      return NextResponse.json({ message: "Invalid item type." }, { status: 400 });
    }
    
    await connectMongoose();
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found:', userId);
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    
    let hasPurchased = false;
    
    if (itemType === 'course') {
      hasPurchased = user.purchasedCourses.includes(itemId);
    } else if (itemType === 'test') {
      hasPurchased = user.purchasedTests.includes(itemId);
    }
    
    console.log(`Purchase check result for ${itemType} ${itemId}:`, hasPurchased);
    
    return NextResponse.json({ 
      hasPurchased,
      message: hasPurchased ? "Item already purchased." : "Item not purchased."
    });
    
  } catch (error) {
    console.error('Purchase check error:', error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
} 