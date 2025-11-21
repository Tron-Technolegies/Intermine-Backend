import mongoose, { model, Schema } from "mongoose";

const MinerSchema = new Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    clientName: {
      type: String,
    },
    workerId: {
      type: String,
      required: true,
    },
    serialNumber: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
    location: {
      type: String,
    },
    warranty: {
      type: Number,
    },
    poolAddress: {
      type: String,
      required: true,
    },
    connectionDate: {
      type: Date,
    },
    serviceProvider: {
      type: String,
    },
    currentIssue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      default: null,
    },
    issueHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Issue",
      },
    ],
    hashRate: {
      type: Number,
    },
    power: {
      type: Number,
    },
    internalNote: {
      type: [String],
      default: [],
    },
    macAddress: {
      type: String,
    },
  },
  { timestamps: true }
);

const Miner = model("Miner", MinerSchema);
export default Miner;
