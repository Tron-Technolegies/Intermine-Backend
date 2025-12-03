import mongoose, { model, Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    message: {
      type: String,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    serviceProvider: {
      type: String,
    },
    miner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Miner",
    },
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
    },
    sendOn: {
      type: Date,
    },
    sendBy: {
      type: String,
    },
  },
  { timestamps: true }
);

const Message = model("Message", MessageSchema);
export default Message;
