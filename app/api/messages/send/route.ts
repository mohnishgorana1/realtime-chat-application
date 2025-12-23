// /api/messages/send
import connectDB from "@/lib/config/db";
import { Message } from "@/models/message.model";
import { Chat } from "@/models/chat.model";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusherServer";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { chatId, senderId, content } = await req.json();

    if (!chatId || !senderId || !content) {
      return NextResponse.json(
        { success: false, error: "Missing data" },
        { status: 400 }
      );
    }

    // 1. Naya message create krte hai
    const newMessage = await Message.create({
      chat: chatId,
      sender: senderId,
      content: content,
      readBy: [senderId], // Bhejne wale ne toh padh hi liya hai
    });

    // 2. Chat model mein 'latestMessage' update karein
    const updatedChat = await Chat.findByIdAndUpdate(chatId, {
      latestMessage: newMessage._id,
    });

    // 3. Sender ki details populate karke bhejien (frontend UI ke liye)
    const populatedMessage = await newMessage.populate("sender", "name avatar");

    // * Pusher Trigger:
    // 1. Channel Name: Chat ID (Unique for this conversation)
    // 2. Event Name: "incoming-message"
    // 3. Data: Naya message object
    await pusherServer.trigger(
      `chat-${chatId}`,
      "incoming-message",
      populatedMessage
    );

    updatedChat.participants.forEach(async (participant: any) => {
      await pusherServer.trigger(
        `user-${participant._id}`, // Har user ka apna private channel
        "sidebar-update",
        {
          chatId: chatId,
          latestMessage: populatedMessage,
          updatedAt: new Date(),
        }
      );
    });


    return NextResponse.json(
      {
        success: true,
        message: "Message Sent Successfully",
        data: populatedMessage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("SEND_MESSAGE_ERROR", error);
    return NextResponse.json(
      { success: false, error: "SEND_MESSAGE_ERROR" },
      { status: 500 }
    );
  }
}
