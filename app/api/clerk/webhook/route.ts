import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { User } from "@/models/user.model";
import connectDB from "@/lib/config/db";

export async function POST(req: Request) {
  await connectDB();
  
  console.log("🔔 Received Clerk Webhook Event");
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("❌ CLERK_WEBHOOK_SECRET is not set");
    return new Response("Error: Secret missing", { status: 500 });
  }

  // Get Svix headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  // IMPORTANT: Get raw body as text for verification
  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("❌ Webhook verification failed");
    return new Response("Error: Verification failed", { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`🔔 Clerk Event: ${eventType}`);

  if (eventType === "user.created") {
    const {
      email_addresses,
      first_name,
      last_name,
      phone_numbers,
      birthday,
      image_url,
    } = evt.data;

    const fullName = `${first_name || ""} ${last_name || ""}`.trim() || "User";
    const email = email_addresses?.[0]?.email_address;
    const phone = phone_numbers?.[0]?.phone_number || "";
    const dob = birthday ? new Date(birthday) : new Date();
    const avatar = image_url;

    try {
      if (!id || !email) {
        return {
          success: false,
          status: 400,
          message: "Missing Clerk ID Or Email",
        };
      }

      console.log("🔍 Checking if user exists in DB...", fullName, email, id, phone, dob, avatar);

      // Check if user already exists
      const existingUser = await User.findOne({ clerkUserId: id });

      if (!existingUser) {
        await User.create({
          clerkUserId: id,
          name: fullName,
          email,
          phone,
          dob,
          avatar,
        });
        console.log("✅ MongoDB: User successfully created!");
      } else {
        console.log("⚠️ MongoDB: User already exists, skipping creation.");
      }
    } catch (dbError: any) {
      console.error("❌ MongoDB Save Error:", dbError.message);
      return NextResponse.json(
        { error: "Database operation failed" },
        { status: 500 }
      );
    }
  }

  if (eventType === "user.deleted") {
    try {
      await User.deleteOne({ clerkUserId: id });
      console.log("🗑️ MongoDB: User successfully deleted!");
    } catch (dbError: any) {
      console.error("❌ MongoDB Delete Error:", dbError.message);
      return NextResponse.json(
        { error: "Database delete failed" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
