"use server";
import connectDB from "@/lib/config/db";
import { User } from "@/models/user.model";

/**
 * Fetch user by Clerk ID
 */
export const fetchUserAccountDetails = async (clerkUserId: string) => {
  await connectDB();

  try {
    if (!clerkUserId) {
      return { success: false, status: 400, message: "Missing clerkUserId" };
    }

    const user = await User.findOne({ clerkUserId }).lean();

    if (!user) {
      return {
        success: false,
        status: 404,
        message: "User not found in DB",
      };
    }

    return { success: true, status: 200, data: user };
  } catch (error: any) {
    console.error("❌ Error fetching user:", error);
    return {
      success: false,
      status: 500,
      message: error?.message || "Failed to fetch user details",
    };
  }
};
