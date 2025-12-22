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

    if (!chatId) {
      return NextResponse.json(
        { success: false, message: "Invalid ChatId " },
        { status: 400 }
      );
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 }); // Purane pehle, naye niche

    console.log("Fetched messages count:", messages.length);

    return NextResponse.json({
      success: true,
      message: "Messages Fetched Successfully",
      data: messages,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch messages " },
      { status: 500 }
    );
  }
}
