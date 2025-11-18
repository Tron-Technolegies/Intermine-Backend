import { NotFoundError } from "../errors/customErrors.js";
import Miner from "../models/Miner.js";
import Issue from "../models/Issue.js";

//get list of user owned miners
export const getAllOwnedMiners = async (req, res) => {
  try {
    const miners = await Miner.find({ client: req.user.userId }).populate(
      "issueHistory"
    );
    if (miners.length < 1) throw new NotFoundError("No miners found");
    res.status(200).json(miners);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};
