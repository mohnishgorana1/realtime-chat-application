import { Schema, model, models, Document } from "mongoose";

export interface IUser {
  clerkUserId: string;
  name: string;
  email: string;
  phone?: string;
  dob: Date;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


interface IUserDoc extends IUser, Document {}

const userSchema = new Schema<IUserDoc>(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
    },
    dob: {
      type: Date,
      required: true,
    },
    avatar: {
      type: String, // optional
    },
  },
  { timestamps: true }
);

export const User = models?.User || model<IUserDoc>("User", userSchema);
