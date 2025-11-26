import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/customErrors.js";
import Agreement from "../models/Agreement.js";
import User from "../models/User.js";

//Get all user agreements
export const getAllUserAgreements = async (req, res) => {
  try {
    const { status, currentPage, query } = req.query;
    const page = Number(currentPage) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;
    const matchStage = {};
    if (status && status !== "ALL") {
      matchStage.signed = status === "signed" ? true : false;
    }
    let searchRegex = null;
    if (query && query.trim() !== "") {
      searchRegex = new RegExp(query, "i");
    }
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          let: { userId: "$user" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            { $project: { clientId: 1, clientName: 1 } },
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
            { "user.clientName": searchRegex },
            { "user.clientId": searchRegex },
          ],
        },
      });
    }
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );
    const agreements = await Agreement.aggregate(pipeline);
    if (agreements.length < 1) throw new NotFoundError("No agreements found");
    const countPipeline = [
      { $match: matchStage },
      ...(query && query.trim() !== ""
        ? [
            {
              $lookup: {
                from: "users",
                let: { userId: "$user" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                  { $project: { clientId: 1, clientName: 1 } },
                ],
                as: "user",
              },
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
              $match: {
                $or: [
                  { "user.clientName": searchRegex },
                  { "user.clientId": searchRegex },
                ],
              },
            },
          ]
        : []),
      { $count: "total" },
    ];
    const countedResult = await Agreement.aggregate(countPipeline);
    const totalAgreements = countedResult[0]?.total || 0;
    const totalPages = Math.ceil(totalAgreements / limit);
    res.status(200).json({ agreements, totalPages });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//send an agreement to the user
export const sendAgreementToUser = async (req, res) => {
  try {
    const { user, type } = req.body;
    const client = await User.findById(user);
    if (!client) throw new NotFoundError("No user found");
    if (type !== "Mining" && type !== "Purchase")
      throw new BadRequestError("Invalid agreement Type");
    if (type === "Mining") {
      if (client.miningAgreement)
        throw new BadRequestError("This user already has a mining Agreement");
      const newAgreement = await Agreement.create({
        agreementType: type,
        user: user,
        issuedOn: new Date(),
        content: "Content -1",
      });
      client.miningAgreement = newAgreement._id;
      await client.save();
      return res
        .status(200)
        .json({ message: "Agreement successfully sent", newAgreement });
    }
    if (type === "Purchase") {
      if (client.purchaseAgreement)
        throw new BadRequestError("This user already has a purchase agreement");
      const newAgreement = await Agreement.create({
        agreementType: type,
        user: user,
        issuedOn: new Date(),
        content: "Content -1",
      });
      client.purchaseAgreement = newAgreement._id;
      await client.save();
      return res
        .status(200)
        .json({ message: "Agreement successfully sent", newAgreement });
    }
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//get User agrement
export const getUserAgreement = async (req, res) => {
  try {
    const agreements = await Agreement.find({ user: req.user.userId });
    res.status(200).json({ agreements });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//sign the agreement
export const signTheAgreement = async (req, res) => {
  try {
    const { agreementId, signature } = req.body;
    const agreement = await Agreement.findById(agreementId);
    if (!agreement) throw new NotFoundError("No agreement found");
    if (agreement.user.toString() !== req.user.userId.toString())
      throw new UnauthorizedError("This agreement doesn't belong to the user");
    agreement.signed = true;
    agreement.signedOn = new Date();
    agreement.signature = signature;
    await agreement.save();
    res
      .status(200)
      .json({ message: "Agreement signed successfully", agreement });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};
