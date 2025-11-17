import mongoose, { model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    clientName: {
      type: String,
      required: true,
    },
    clientId: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    address: {
      type: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
      },
    },
    verification: {
      type: String,
    },
    internalNote: {
      type: [String],
      default: [],
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    phone: {
      type: String,
    },
    companyName: {
      type: String,
    },
    miningAgreement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agreement",
    },
    purchaseAgreement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agreement",
    },
    role: {
      type: String,
      default: "Client",
      enum: ["Client", "Admin"],
    },
    owned: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Miner",
        },
      ],
    },
  },
  { timestamps: true }
);

UserSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});
const User = model("User", UserSchema);
export default User;
