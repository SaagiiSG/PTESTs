import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import User from "@/app/models/user";

export async function POST(req: Request) {
  const session = await auth();
  const data = await req.json();

  await connectMongoose();

  // Determine which user to update
  let targetUser: any = null;

  if (session?.user?.id) {
    targetUser = await User.findById(session.user.id);
  } else {
    // Allow first-time profile completion without auth if user is verified and incomplete
    const query: any = {};
    if (data?.email) query.email = data.email;
    if (!query.email && data?.phoneNumber) query.phoneNumber = data.phoneNumber;

    if (query.email || query.phoneNumber) {
      const candidate = await User.findOne(query);
      if (candidate) {
        const isVerifiedMatch = (
          (data?.email && candidate.email === data.email && candidate.isEmailVerified === true) ||
          (data?.phoneNumber && candidate.phoneNumber === data.phoneNumber && candidate.isPhoneVerified === true)
        );

        const isProfileIncomplete = !candidate.name || !candidate.dateOfBirth || !candidate.gender || !candidate.education || !candidate.family || !candidate.position;

        if (isVerifiedMatch && isProfileIncomplete) {
          targetUser = candidate;
        }
      }
    }
  }

  if (!targetUser) {
    return NextResponse.json(
      { message: "Not authorized to update profile. Please log in." },
      { status: 401 }
    );
  }

  // Prepare update payload - do not allow changing identifiers here
  const update: any = {
    name: data.name,
    age: data.age,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    education: data.education,
    family: data.family,
    position: data.position,
  };

  // Allow email set only if empty and request email matches verified email (for safety)
  if (!targetUser.email && data.email && targetUser.isEmailVerified && targetUser.email === data.email) {
    update.email = data.email;
  }

  const updated = await User.findByIdAndUpdate(targetUser._id, update, { new: true }).lean() as any;

  if (!updated) {
    return NextResponse.json(
      { message: "User not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    name: updated.name,
    email: updated.email,
    phoneNumber: updated.phoneNumber,
    age: updated.age,
    gender: updated.gender,
    dateOfBirth: updated.dateOfBirth,
    education: updated.education,
    family: updated.family,
    position: updated.position,
  });
}
