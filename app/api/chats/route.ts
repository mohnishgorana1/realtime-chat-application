import connectDB from "@/lib/config/db";
import { Chat } from "@/models/chat.model";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const isGroup = searchParams.get("isGroup") === "true";
    console.log("Fetching chats for user:", userId, "isGroup:", isGroup);
    // Find chats where user is a participant
    const chats = await Chat.find({
      participants: { $in: [userId] }, // Current user ka hona zaroori hai
      isGroupChat: isGroup
    })
    .populate("participants", "name email avatar")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

    console.log(chats);

    return NextResponse.json({ success: true, chats });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}