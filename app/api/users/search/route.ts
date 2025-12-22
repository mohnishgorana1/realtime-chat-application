import connectDB from "@/lib/config/db";
import { User } from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) return NextResponse.json({ users: [] });

    // Find users by name or email (regex for partial match)
    // current user ko exclude karne ke liye aap filter add kar sakte hain
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }).limit(5);

    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Search failed" }, { status: 500 });
  }
}