import { Schema, model, models, Document, Types } from "mongoose";

export interface IMessage {
  sender: Types.ObjectId;
  content: string;
  chat: Types.ObjectId;
  readBy: Types.ObjectId[]; // Track who has seen the message
  createdAt?: Date;
  updatedAt?: Date;
}

interface IMessageDoc extends IMessage, Document {}

const messageSchema = new Schema<IMessageDoc>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Message = models?.Message || model<IMessageDoc>("Message", messageSchema);