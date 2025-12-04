import Issue from "../models/Issue.js";
import Miner from "../models/Miner.js";
import User from "../models/User.js";

export const getAdminStats = async (req, res) => {
  try {
    const miners = await Miner.countDocuments();
    const issues = await Issue.countDocuments();
    const clients = await User.countDocuments({ role: "Client" });
    const onlineMiners = await Miner.countDocuments({ status: "online" });
    const offlineMiners = await Miner.countDocuments({ status: "offline" });
    res
      .status(200)
      .json({ miners, issues, clients, onlineMiners, offlineMiners });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

export const getGraphStats = async (req, res) => {
  try {
    const { type } = req.query;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let endDate;
    if (type === "month") {
      endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() - 1);
    } else if (type === "year") {
      endDate = new Date(today);
      endDate.setFullYear(endDate.getFullYear() - 1);
    } else {
      endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() - 1);
    }
    endDate.setHours(0, 0, 0, 0);
    const users = await User.find({
      createdAt: { $lte: today, $gte: endDate },
    })
      .select("createdAt")
      .lean();
    const issues = await Issue.find({
      createdAt: { $lte: today, $gte: endDate },
    })
      .select("createdAt")
      .lean();
    res.status(200).json({ users, issues });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};
