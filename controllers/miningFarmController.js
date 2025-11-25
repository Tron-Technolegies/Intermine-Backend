import { NotFoundError } from "../errors/customErrors.js";
import MiningFarm from "../models/MiningFarm.js";

export const getAllMiningFarms = async (req, res) => {
  try {
    const farms = await MiningFarm.find();
    res.status(200).json(farms);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

export const addNewMiningFarm = async (req, res) => {
  try {
    const { farm, capacity } = req.body;
    const newFarm = await MiningFarm.create({
      farm,
      capacity,
    });
    res.status(200).json({ message: "New Farm added successfully", newFarm });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

export const editMiningFarm = async (req, res) => {
  try {
    const { farm, capacity, farmId } = req.body;
    const miningFarm = await MiningFarm.findById(farmId);
    if (!miningFarm) throw new NotFoundError("No mining Farm found");
    miningFarm.farm = farm;
    miningFarm.capacity = capacity;
    await miningFarm.save();
    res.status(200).json({ message: "Successfully updated", miningFarm });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};
