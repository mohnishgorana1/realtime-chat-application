// /api/messages/read
import connectDB from "@/lib/config/db";
import { Message } from "@/models/message.model";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusherServer";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { chatId, userId } = await req.json();

    if (!chatId || !userId) {
      return new NextResponse("Missing data", { status: 400 });
    }
    // 1. Update Messages in DB
    // Update all messages in this chat where userId is NOT in readBy array
    const updateResult = await Message.updateMany(
      {
        chat: chatId,
        readBy: { $ne: userId }, // $ne means "not equal" / not present
      },
      {
        $addToSet: { readBy: userId }, // $addToSet prevents duplicates
      }
    );


    // 2. REAL-TIME TRIGGER
    // Agar koi message update hua hai, to hi event bhejo
    if (updateResult.modifiedCount > 0) {
      await pusherServer.trigger(`chat-${chatId}`, "messages-read", {
        chatId,
        readerId: userId, // Jisne message padha
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("MARK_READ_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
