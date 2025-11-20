import mongoose, { model, Schema } from "mongoose";

const IssueSchema = new Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IssueType",
      required: true,
    },
    workerAddress: {
      type: String,
    },
    miner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Miner",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    serviceProvider: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
    },
    response: {
      type: String,
    },
    type: {
      type: String,
      enum: ["repair", "change"],
    },
    messages: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Message",
    },
  },
  { timestamps: true }
);

const Issue = model("Issue", IssueSchema);
export default Issue;
