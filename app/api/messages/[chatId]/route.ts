// /api/messages/[chatId]
import connectDB from "@/lib/config/db";
import { Message } from "@/models/message.model";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    await connectDB();
    const { chatId } = await params;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10"); // Default 10 messages
    const skip = (page - 1) * limit;

    if (!chatId) {
      return NextResponse.json(
        { success: false, message: "Invalid ChatId " },
        { status: 400 }
      );
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalMessages = await Message.countDocuments({ chat: chatId });
    const hasMore = totalMessages > skip + messages.length;

    // Messages ko wapas chronological order (Oldest -> Newest) me convert karo UI ke liye
    const reversedMessages = messages.reverse();

    console.log("Fetched messages count:", messages.length);

    return NextResponse.json({
      success: true,
      message: "Messages Fetched Successfully",
      data: reversedMessages,
      pagination: {
        page,
        hasMore,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch messages " },
      { status: 500 }
    );
  }
}
