import mongoose, { model, Schema } from "mongoose";

const WarrantySchema = new Schema(
  {
    warrantyType: {
      type: String,
      required: true,
      enum: ["Manufacturer", "Intermine"],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    miner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Miner",
      required: true,
    },
    status: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Warranty = model("Warranty", WarrantySchema);
export default Warranty;
