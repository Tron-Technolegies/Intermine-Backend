import mongoose, { model, Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    problem: {
      type: String,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["read", "unread"],
    },
    miner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Miner",
    },
    isForAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = model("Notification", NotificationSchema);
export default Notification;
