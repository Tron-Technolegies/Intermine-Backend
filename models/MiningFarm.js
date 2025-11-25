import { model, Schema } from "mongoose";

const MiningFarmSchema = new Schema(
  {
    farm: {
      type: String,
      unique: true,
    },
    capacity: {
      type: Number,
    },
    current: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const MiningFarm = model("MiningFarm", MiningFarmSchema);
export default MiningFarm;
