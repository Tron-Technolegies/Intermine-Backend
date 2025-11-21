import mongoose from "mongoose";
import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import Issue from "../models/Issue.js";
import IssueType from "../models/IssueType.js";
import Miner from "../models/Miner.js";
import Notification from "../models/Notification.js";

//get all issueTypes for dropdown
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

// Add issue by client
export const addIssueByClient = async (req, res) => {
  try {
    const { issue, workerAddress, miner, description } = req.body;
    const targetMiner = await Miner.findById(miner);
    if (!targetMiner) throw new NotFoundError("No miner found");
    if (targetMiner.client.toString() !== req.user.userId.toString())
      throw new BadRequestError("You are not Authorised to do this operation");
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
      description: description,
      user: req.user.userId,
      status: "Pending",
      serviceProvider: targetMiner.serviceProvider,
      type: "repair",
    });
    targetMiner.issueHistory.push(newIssue._id);
    targetMiner.currentIssue = newIssue._id;
    await targetMiner.save();
    const newNotification = await Notification.create({
      problem: `An issue ${targetIssue.issueType} has been reported for the miner ${targetMiner.model} (${targetMiner.workerId})- ${targetMiner.clientName}`,
      client: req.user.userId,
      miner: miner,
      status: "unread",
      isForAdmin: true,
    });
    res.status(201).json({ message: "issue Added", newIssue, newNotification });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//get All Issues of User
export const GetAllIssuesByClient = async (req, res) => {
  try {
    const { status, currentPage } = req.query;
    const queryObject = {
      user: req.user.userId,
    };
    if (status && status !== "ALL") {
      queryObject.status = status;
    }
    const page = Number(currentPage) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;
    const issues = await Issue.find(queryObject)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    if (issues.length < 1) throw new NotFoundError("No issues found");
    const totalIssues = await Issue.countDocuments(queryObject);
    const totalPages = Math.ceil(totalIssues / limit);
    res.status(200).json({ issues, totalPages, totalIssues });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//get all issue statistics

export const getAllIssueStatsByClient = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const stats = await Issue.aggregate([
      { $match: { user: userObjectId } },
      {
        $facet: {
          allIssues: [{ $count: "count" }],
          pending: [{ $match: { status: "Pending" } }, { $count: "count" }],
          resolved: [{ $match: { status: "Resolved" } }, { $count: "count" }],
          warranty: [{ $match: { status: "Warranty" } }, { $count: "count" }],
          repair: [{ $match: { type: "repair" } }, { $count: "count" }],
        },
      },
    ]);
    const result = {
      allIssues: stats[0].allIssues[0]?.count || 0,
      pending: stats[0].pending[0]?.count || 0,
      resolved: stats[0].resolved[0]?.count || 0,
      warranty: stats[0].warranty[0]?.count || 0,
      repair: stats[0].repair[0]?.count || 0,
    };
    res.status(200).json(result);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};
