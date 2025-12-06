import Issue from "../models/Issue.js";
import { NotFoundError } from "../errors/customErrors.js";
import PendingMessage from "../models/PendingMessages.js";
import axios from "axios";
import { DAHAB_URL } from "../utils/urls.js";
import Message from "../models/Message.js";

//get pending messages
export const getPendingMessages = async (req, res) => {
  try {
    const { currentPage, query } = req.query;
    const queryObject = {};
    const page = Number(currentPage) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    if (query && query !== "") {
      const searchRegex = new RegExp(query, "i");
      queryObject.$or = [
        { message: searchRegex },
        { issueType: searchRegex },
        { clientName: searchRegex },
        { miner: searchRegex },
        { serialNumber: searchRegex },
      ];
    }
    const messages = await PendingMessage.find(queryObject)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalMessages = await PendingMessage.countDocuments(queryObject);
    const totalPages = Math.ceil(totalMessages / limit);
    res.status(200).json({ messages, totalPages, totalMessages });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//get Messages for a particular issue
export const getMessagesForAnIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await Issue.findById(id)
      .select("messages")
      .lean()
      .populate("messages")
      .sort({ createdAt: -1 });
    if (!issue) throw new NotFoundError("No issue found");
    res.status(200).json(issue);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//get Single Pending Message
export const getSinglePendingMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const msg = await PendingMessage.findById(id);
    if (!msg) throw new NotFoundError("No Message found");
    res.status(200).json(msg);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//Edit a Pending Message
export const editPendingMessage = async (req, res) => {
  try {
    const { id, serviceProviderId, message } = req.body;
    const msg = await PendingMessage.findById(id);
    if (!msg) throw new NotFoundError("No Pending message found");
    msg.message = message;
    msg.status = "Modified";
    msg.isUpdated = true;
    await axios.patch(
      `${DAHAB_URL}/update-status`,
      {
        messageId: serviceProviderId,
        message: message,
        status: "Modified",
      },
      {
        headers: {
          "x-api-key": process.env.DAHAB_API_KEY,
        },
      }
    );
    await msg.save();
    res.status(200).json({ message: "success", msg });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//cancel a pending Message
export const cancelPendingMessage = async (req, res) => {
  try {
    const { id, serviceProviderId, message } = req.body;
    const msg = await PendingMessage.findById(id);
    if (!msg) throw new NotFoundError("No Message Found");
    msg.status = "Cancelled";
    await axios.patch(
      `${DAHAB_URL}/update-status`,
      {
        messageId: serviceProviderId,
        message: message,
        status: "Cancelled",
      },
      {
        headers: {
          "x-api-key": process.env.DAHAB_API_KEY,
        },
      }
    );
    await msg.save();
    res.status(200).json({ message: "success", msg });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};

//Release Pending Message
export const releasePendingMessage = async (req, res) => {
  try {
    const { id, serviceProviderId, message } = req.body;
    const msg = await PendingMessage.findById(id);
    if (!msg) throw new NotFoundError("No message found");
    const issue = await Issue.findById(msg.issue);
    if (!issue) throw new NotFoundError("No issue found");
    const newMessage = new Message({
      message: message,
      client: issue.user,
      miner: issue.miner,
      issue: issue._id,
      sendBy: issue.serviceProvider,
      serviceProvider: issue.serviceProvider,
      sendOn: new Date(),
    });
    issue.messages.push(newMessage._id);
    let newStatus = msg.isUpdated ? "Modified & Released" : "Released";
    msg.status = newStatus;
    await axios.patch(
      `${DAHAB_URL}/update-status`,
      {
        messageId: serviceProviderId,
        message: message,
        status: newStatus,
      },
      {
        headers: {
          "x-api-key": process.env.DAHAB_API_KEY,
        },
      }
    );
    await msg.save();
    await issue.save();
    await newMessage.save();
    res.status(200).json({ message: "success", msg });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};
