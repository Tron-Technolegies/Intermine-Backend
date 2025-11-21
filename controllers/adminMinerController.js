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

//Get All Offline Miners
export const getOfflineMiners = async (req, res) => {
  try {
    const { currentPage, query } = req.query;
    const page = Number(currentPage) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;
    const matchStage = { status: "offline" };
    if (query && query.trim() !== "") {
      const searchRegex = new RegExp(query, "i");
      matchStage.$or = [
        { "client.clientName": searchRegex },
        { "client.clientId": searchRegex },
        { "currentIssue.issue.issueType": searchRegex },
      ];
    }
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
      { $unwind: "$currentIssue" },
      { $sort: { createdAt: -1 } },

      { $skip: skip },
      { $limit: limit },
    ];
    const miners = await Miner.aggregate(pipeline);
    if (miners.length < 1) throw new NotFoundError("No miners found");
    const countPipeline = [...pipeline.slice(0, -2), { $count: "total" }];
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
