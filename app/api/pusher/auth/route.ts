// /api/pusher/auth
import { pusherServer } from "@/lib/pusherServer";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/config/db";
import { User } from "@/models/user.model";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const socketId = params.get("socket_id");
    const channel = params.get("channel_name");

    const clerkUser = await currentUser();
    if (!clerkUser || !socketId || !channel) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();
    const dbUser = await User.findOne({ clerkUserId: clerkUser.id });
    if (!dbUser) return new NextResponse("User not found", { status: 404 });

    const presenceData = {
      user_id: dbUser._id.toString(),
      user_info: {
        name: dbUser.name,
        avatar: dbUser.avatar,
      },
    };

    const authResponse = pusherServer.authorizeChannel(socketId, channel, presenceData);
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("PUSHER_AUTH_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}