import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import Miner from "../models/Miner.js";
import User from "../models/User.js";
import Issue from "../models/Issue.js";
import MiningFarm from "../models/MiningFarm.js";

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
    const miningFarm = await MiningFarm.findById(location);
    if (!miningFarm) throw new NotFoundError("No mining Farm found");
    const newTotal = miningFarm.current + Number(power);
    if (miningFarm.capacity < newTotal)
      throw new BadRequestError("Mining Farm maximum capacity reached");
    const miner = await Miner.create({
      client: client,
      clientName: clientUser.clientName,
      workerId: workerId,
      serialNumber: serialNumber,
      model: model,
      status: status,
      location: miningFarm.farm,
      warranty: warranty,
      poolAddress: poolAddress,
      connectionDate: new Date(connectionDate),
      serviceProvider: serviceProvider,
      hashRate: hashRate,
      power: power,
      macAddress: macAddress,
    });
    clientUser.owned.push(miner._id);
    miningFarm.current = miningFarm.current + Number(power);
    await clientUser.save();
    await miningFarm.save();
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

//Get All Offline Miners
export const getOfflineMiners = async (req, res) => {
  try {
    const { currentPage, query } = req.query;
    const page = Number(currentPage) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;
    const matchStage = { status: "offline" };
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          let: { clientId: "$client" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$clientId"] } } },
            { $project: { clientId: 1, clientName: 1 } },
          ],
          as: "client",
        },
      },
      { $unwind: "$client" },
      {
        $lookup: {
          from: "issues",
          let: { currentIssueId: "$currentIssue" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$currentIssueId"] } } },
            {
              $lookup: {
                from: "issuetypes",
                let: { typeId: "$issue" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$typeId"] } } },
                  { $project: { issueType: 1 } },
                ],
                as: "issue",
              },
            },
            { $unwind: "$issue" },
            {
              $lookup: {
                from: "messages",
                localField: "messages",
                foreignField: "_id",
                as: "messages",
              },
            },
            { $project: { issue: 1, status: 1, messages: 1 } },
          ],
          as: "currentIssue",
        },
      },
      {
        $unwind: {
          path: "$currentIssue",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    if (query && query.trim() !== "") {
      const searchRegex = new RegExp(query, "i");
      pipeline.push({
        $match: {
          $or: [
            { "client.clientName": searchRegex },
            { "client.clientId": searchRegex },
            { "currentIssue.issue.issueType": searchRegex },
          ],
        },
      });
    }
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );
    const miners = await Miner.aggregate(pipeline);
    if (miners.length < 1) throw new NotFoundError("No miners found");
    const countPipeline = [...pipeline.slice(0, -3), { $count: "total" }];
    const countResult = await Miner.aggregate(countPipeline);
    const totalMiners = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalMiners / limit);
    res.status(200).json({ miners, totalPages });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//Get a single Miner
export const getASingleMiner = async (req, res) => {
  try {
    const miner = await Miner.findById(req.params.id);
    if (!miner) throw new NotFoundError("No miner found");
    res.status(200).json(miner);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//Edit a new Miner
export const editMiner = async (req, res) => {
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
    if (!clientUser) throw new NotFoundError("No client user found");

    const miner = await Miner.findById(req.params.id);
    if (!miner) throw new NotFoundError("No miner found");

    const newFarm = await MiningFarm.findById(location);
    if (!newFarm) throw new NotFoundError("Mining Farm not found");

    const oldPower = miner.power;
    const newPower = Number(power);
    const oldFarmName = miner.location;

    let oldFarm = null;
    if (oldFarmName !== newFarm.farm) {
      oldFarm = await MiningFarm.findOne({ farm: oldFarmName });
      if (!oldFarm) throw new NotFoundError("Old mining farm not found");
    }

    if (oldFarmName === newFarm.farm) {
      const adjusted = newFarm.current - oldPower + newPower;
      if (adjusted > newFarm.capacity)
        throw new BadRequestError("Capacity exceeded at current farm");
    } else {
      const newFarmAdjusted = newFarm.current + newPower;
      if (newFarmAdjusted > newFarm.capacity)
        throw new BadRequestError("Capacity exceeded at new Farm");
    }

    if (oldFarmName !== newFarm.farm) {
      oldFarm.current -= oldPower;
      newFarm.current += newPower;
      await oldFarm.save();
      await newFarm.save();
    } else if (oldPower !== newPower) {
      newFarm.current = newFarm.current - oldPower + newPower;
      await newFarm.save();
    }

    if (miner.client.toString() !== clientUser._id.toString()) {
      const oldClient = await User.findById(miner.client);
      if (oldClient) {
        oldClient.owned = oldClient.owned.filter(
          (id) => id.toString() !== miner._id.toString()
        );
        await oldClient.save();
      }
      if (!clientUser.owned.includes(miner._id)) {
        clientUser.owned.push(miner._id);
      }
      miner.client = client;
      miner.clientName = clientUser.clientName;
    }

    miner.workerId = workerId;
    miner.serialNumber = serialNumber;
    miner.model = model;
    miner.status = status;
    miner.location = newFarm.farm;
    miner.warranty = warranty;
    miner.poolAddress = poolAddress;
    miner.connectionDate = new Date(connectionDate);
    miner.serviceProvider = serviceProvider;
    miner.hashRate = hashRate;
    miner.power = newPower;
    miner.macAddress = macAddress;

    await miner.save();
    await clientUser.save();

    res.status(200).json({ message: "successs", miner });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//Get All Miners filtered by location
export const getAllMinersbyLocation = async (req, res) => {
  try {
    const { query, status, currentPage, location } = req.query;
    const page = Number(currentPage) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const queryObject = {};
    if (location && location !== "ALL") {
      queryObject.location = location;
    }
    if (status && status !== "ALL") {
      queryObject.status = status;
    }
    if (query && query.trim() !== "") {
      const searchRegex = new RegExp(query, "i");
      queryObject.$or = [
        { model: searchRegex },
        { workerId: searchRegex },
        { serialNumber: searchRegex },
        { macAddress: searchRegex },
      ];
    }
    const miners = await Miner.find(queryObject)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
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
