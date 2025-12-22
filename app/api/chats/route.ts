import connectDB from "@/lib/config/db";
import { Chat } from "@/models/chat.model";
import { Message } from "@/models/message.model";
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
      isGroupChat: isGroup,
    })
      .populate("participants", "name email avatar")
      .populate({
        path: "latestMessage",
        model: Message,
        populate: {
          path: "sender",
          model: "User",
          select: "name avatar",
        },
      })
      .sort({ updatedAt: -1 });

    console.log(chats);

    return NextResponse.json({ success: true, data: chats });
  } catch (error) {
    console.log("Eror", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
