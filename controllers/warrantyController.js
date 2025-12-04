import { NotFoundError } from "../errors/customErrors.js";
import Warranty from "../models/Warranty.js";

//get all warranties
export const getAllWarranties = async (req, res) => {
  try {
    const { currentPage, type, query } = req.query;
    const matchStage = {};
    if (type && type !== "ALL") {
      matchStage.warrantyType = type;
    }
    const page = Number(currentPage || 1);
    const limit = 20;
    const skip = (page - 1) * limit;
    let searchRegex = null;
    if (query && query.trim() !== "") {
      searchRegex = new RegExp(query, "i");
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "miners",
          let: { minerId: "$miner" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$minerId"] } } },
            { $project: { model: 1, serialNumber: 1 } },
          ],
          as: "miner",
        },
      },
      { $unwind: { path: "$miner", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          let: { userId: "$user" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            { $project: { clientName: 1, clientId: 1 } },
          ],
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    ];
    if (query && query.trim() !== "") {
      pipeline.push({
        $match: {
          $or: [
            { "miner.model": searchRegex },
            { "miner.serialNumber": searchRegex },
            { "user.clientName": searchRegex },
            { "user.clientId": searchRegex },
          ],
        },
      });
    }
    pipeline.push(
      {
        $sort: { createdAt: -1 },
      },
      { $skip: skip },
      { $limit: limit }
    );
    const warranties = await Warranty.aggregate(pipeline);
    if (warranties.length < 1) throw new NotFoundError("No warranties found");
    const countPipeline = [
      { $match: matchStage },
      ...(query && query.trim() !== ""
        ? [
            {
              $lookup: {
                from: "miners",
                let: { minerId: "$miner" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$minerId"] } } },
                  { $project: { model: 1, serialNumber: 1 } },
                ],
                as: "miner",
              },
            },
            { $unwind: { path: "$miner", preserveNullAndEmptyArrays: true } },

            {
              $lookup: {
                from: "users",
                let: { userId: "$user" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                  { $project: { clientName: 1, clientId: 1 } },
                ],
                as: "user",
              },
            },
            {
              $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
            },
            {
              $match: {
                $or: [
                  { "miner.model": searchRegex },
                  { "miner.serialNumber": searchRegex },
                  { "user.clientName": searchRegex },
                  { "user.clientId": searchRegex },
                ],
              },
            },
          ]
        : []),
      { $count: "total" },
    ];
    const countResult = await Warranty.aggregate(countPipeline);
    const totalWarranties = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalWarranties / limit);
    res.status(200).json({ warranties, totalPages });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//get single warranty
export const getSingleWarranty = async (req, res) => {
  try {
    const warranty = await Warranty.findById(req.params.id);
    if (!warranty) throw new NotFoundError("No warranty found");
    res.status(200).json(warranty);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//Update Warranty
export const updateWarranty = async (req, res) => {
  try {
    const { type, startDate, endDate, warrantyId } = req.body;
    const warranty = await Warranty.findById(warrantyId);
    if (!warranty) throw new NotFoundError("No warranty found");
    warranty.warrantyType = type;
    warranty.startDate = new Date(startDate);
    warranty.endDate = new Date(endDate);
    await warranty.save();
    res
      .status(200)
      .json({ message: "Warranty successfully updated", warranty });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//get All warranty stats
export const getWarrantyStats = async (req, res) => {
  try {
    const warranties = await Warranty.countDocuments();
    const today = new Date();
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    const active = await Warranty.countDocuments({ endDate: { $gte: today } });
    const expired = warranties - active;
    const expireSoon = await Warranty.countDocuments({
      endDate: { $gte: today, $lte: oneMonthLater },
    });
    res.status(200).json({ warranties, active, expired, expireSoon });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};
