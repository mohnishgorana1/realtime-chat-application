import { Schema, model, models, Document, Types } from "mongoose";

export interface IChat {
  participants: Types.ObjectId[]; // Users involved in the chat
  isGroupChat: boolean;
  chatName?: string;
  latestMessage?: Types.ObjectId; // For showing last message in sidebar
  createdAt?: Date;
  updatedAt?: Date;
}

interface IChatDoc extends IChat, Document {}

const chatSchema = new Schema<IChatDoc>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    chatName: {
      type: String,
      trim: true,
    },
    latestMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

export const Chat = models?.Chat || model<IChatDoc>("Chat", chatSchema);