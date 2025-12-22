// app/api/chats/create/route.ts

import connectDB from "@/lib/config/db";
import { Chat } from "@/models/chat.model";
import { User } from "@/models/user.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    console.log("POST request received at /api/chats/create");
  try {
    await connectDB();

    const { appUser, otherUser } = await req.json();
    if (!appUser || !otherUser) {
      return NextResponse.json(
        { success: false, message: "Missing parameters" },
        { status: 400 }
      );
    }
    console.log("App User:", appUser, "Other User:", otherUser);

    // Ensure users exist

    if (appUser === otherUser) {
      return NextResponse.json(
        { success: false, message: "Cannot create chat with yourself" },
        { status: 400 }
      );
    }

    // 1. Check if chat already exists between these two users
    const existingChat = await Chat.findOne({
      isGroupChat: false,
      $and: [
        { participants: { $elemMatch: { $eq: appUser } } },
        { participants: { $elemMatch: { $eq: otherUser } } },
      ],
    })
      .populate("participants", "-password") // password ko exclude karein
      .populate("latestMessage");

    if (existingChat) {
      return NextResponse.json(
        { success: true, chat: existingChat },
        { status: 500 }
      );
    }

    const chatData = {
      chatName: "sender", // Default name
      isGroupChat: false,
      participants: [appUser, otherUser],
    };

    const createdChat = await Chat.create(chatData);
    // Naye chat ko populate karke bhejein taaki UI mein details mil sakein
    const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
      "participants",
      "-password"
    );

    console.log("New chat created:", fullChat);

    return NextResponse.json(
      { success: true, chat: fullChat },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Search failed" },
      { status: 500 }
    );
  }
}
