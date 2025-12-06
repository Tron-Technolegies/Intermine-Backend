import mongoose, { model, Schema } from "mongoose";

const PendingMessageSchema = new Schema(
  {
    message: {
      type: String,
    },
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
    },
    clientName: {
      type: String,
    },
    serviceProviderId: {
      type: String,
    },
    miner: {
      type: String,
    },
    issueType: {
      type: String,
    },
    sendBy: {
      type: String,
    },
    serialNumber: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Released",
        "Cancelled",
        "Modified",
        "Modified & Released",
      ],
    },
    isUpdated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const PendingMessage = model("PendingMessage", PendingMessageSchema);
export default PendingMessage;
