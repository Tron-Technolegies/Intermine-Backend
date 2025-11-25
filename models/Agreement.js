import mongoose, { model, Schema } from "mongoose";

export const AgreementSchema = new Schema(
  {
    agreementType: {
      type: String,
      required: true,
      enum: ["Mining", "Purchase"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    signed: {
      type: Boolean,
      default: false,
    },
    signedOn: {
      type: Date,
    },
    issuedOn: {
      type: Date,
    },
    content: {
      type: String,
    },
    signature: {
      type: String,
    },
  },
  { timestamps: true }
);

const Agreement = model("Agreement", AgreementSchema);
export default Agreement;
