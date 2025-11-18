import { NotFoundError } from "../errors/customErrors.js";
import Miner from "../models/Miner.js";
import User from "../models/User.js";
import Issue from "../models/Issue.js";

//Add a new Miner by Admin
export const addNewMiner = async (req, res) => {
  try {
    const {
      client,
      workerId,
      serialNumber,
      model,
      status,
      location,
      warranty,
      poolAddress,
      connectionDate,
      serviceProvider,
      hashRate,
      power,
      macAddress,
    } = req.body;
    const clientUser = await User.findById(client);
    if (!clientUser) throw new NotFoundError("No client Found");
    const miner = await Miner.create({
      client: client,
      clientName: clientUser.clientName,
      workerId: workerId,
      serialNumber: serialNumber,
      model: model,
      status: status,
      location: location,
      warranty: warranty,
      poolAddress: poolAddress,
      connectionDate: new Date(connectionDate),
      serviceProvider: serviceProvider,
      hashRate: hashRate,
      power: power,
      macAddress: macAddress,
    });
    clientUser.owned.push(miner._id);
    await clientUser.save();
    res.status(200).json({ message: "New Miner Added", miner });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//Get List of All miners by admin
export const getAllMiners = async (req, res) => {
  try {
    const { currentPage, query, status } = req.query;
    const queryObject = {};
    if (query && query !== "") {
      queryObject.$or = [
        { poolAddress: { $regex: query, $options: "i" } },
        { clientName: { $regex: query, $options: "i" } },
        { model: { $regex: query, $options: "i" } },
        { workerId: { $regex: query, $options: "i" } },
      ];
    }
    if (status && status !== "ALL") {
      queryObject.status = status;
    }
    const page = Number(currentPage) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;
    //need to add populating of issueHistory later
    const miners = await Miner.find(queryObject)
      .populate("client", "clientName clientId")
      .populate("issueHistory")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    if (miners.length < 1) throw new NotFoundError("No miners found");
    const totalMiners = await Miner.countDocuments(queryObject);
    const totalPages = Math.ceil(totalMiners / limit);
    res.status(200).json({ miners, totalPages });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//Get User Owned Miner
