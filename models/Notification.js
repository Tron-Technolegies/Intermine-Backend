import mongoose, { model, Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    problem: {
      type: String,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
    },
    status: {
      type: String,
    },
    miner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Miner",
    },
  },
  {
    timestamps: true,
  }
);

const Notification = model("Notification", NotificationSchema);
export default Notification;
