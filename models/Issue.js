import mongoose, { model, Schema } from "mongoose";

const IssueSchema = new Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IssueType",
    },
    workerAddress: {
      type: String,
    },
    changeRequest: {
      pool: String,
      worker: String,
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
    serviceProviderReminded: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const Issue = model("Issue", IssueSchema);
export default Issue;
