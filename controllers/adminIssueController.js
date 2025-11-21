import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import Issue from "../models/Issue.js";
import IssueType from "../models/IssueType.js";
import Miner from "../models/Miner.js";
import Notification from "../models/Notification.js";

//Add a new Issue Type
export const addIssueType = async (req, res) => {
  try {
    const { issueType } = req.body;
    const newType = await IssueType.create({
      issueType: issueType,
    });
    res.status(201).json(newType);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//get All IssueTypes
export const getAllIssueTypes = async (req, res) => {
  try {
    const issueTypes = await IssueType.find();
    if (issueTypes.length < 1) throw new NotFoundError("No issue Types found");
    res.status(200).json(issueTypes);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//Add a new Issue
export const addNewIssue = async (req, res) => {
  try {
    const { issue, workerAddress, miner, user, offline } = req.body;
    const targetMiner = await Miner.findById(miner);
    if (!targetMiner) throw new NotFoundError("No miner found");
    const targetIssue = await IssueType.findById(issue);
    if (!targetIssue) throw new NotFoundError("No issue Type has been found");
    if (workerAddress !== targetMiner.workerId)
      throw new BadRequestError("Invalid Worker Id");
    if (targetMiner.currentIssue)
      throw new BadRequestError("An issue is already reported for this miner");
    const newIssue = await Issue.create({
      issue: issue,
      workerAddress: workerAddress,
      miner: miner,
      user: user,
      status: "Pending",
      serviceProvider: targetMiner.serviceProvider,
      type: "repair",
    });
    targetMiner.issueHistory.push(newIssue._id);
    targetMiner.currentIssue = newIssue._id;
    if (offline === true || offline === "true") {
      targetMiner.status = "offline";
    }
    await targetMiner.save();
    const newNotification = await Notification.create({
      problem: `An issue ${targetIssue.issueType} has been reported for your miner ${targetMiner.model} (${targetMiner.workerId})`,
      client: user,
      miner: miner,
      status: "unread",
    });
    res.status(201).json({ message: "issue Added", newIssue, newNotification });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//Get All Issues
export const getAllIssues = async (req, res) => {
  try {
    const { status, currentPage, query } = req.query;
    const page = Number(currentPage) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;
    const matchStage = {};
    if (status && status !== "ALL") {
      matchStage.status = status;
    }
    if (query && query.trim() !== "") {
      const searchRegex = new RegExp(query, "i");
      matchStage.$or = [
        { "user.clientName": searchRegex },
        { "user.clientId": searchRegex },
        { "miner.model": searchRegex },
        { "miner.workerId": searchRegex },
        { "issue.issueType": searchRegex },
      ];
    }
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          let: { userId: "$user" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            {
              $project: { clientName: 1, clientId: 1 },
            },
          ],
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "miners",
          let: { minerId: "$miner" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$minerId"] } } },
            {
              $project: {
                model: 1,
                status: 1,
                serviceProvider: 1,
                poolAddress: 1,
                workerId: 1,
              },
            },
          ],
          as: "miner",
        },
      },
      {
        $unwind: "$miner",
      },
      {
        $lookup: {
          from: "issuetypes",
          let: { issueId: "$issue" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$issueId"] } } },
            { $project: { issueType: 1 } },
          ],
          as: "issue",
        },
      },
      { $unwind: "$issue" },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];
    const issues = await Issue.aggregate(pipeline);
    if (issues.length < 1) throw new NotFoundError("No issues found");
    const countPipeline = [...pipeline.slice(0, -2), { $count: "total" }];
    const countResult = await Issue.aggregate(countPipeline);
    const totalIssues = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalIssues / limit);
    res.status(200).json({ issues, totalPages });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};
