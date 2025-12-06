import { NotFoundError } from "../errors/customErrors.js";
import Issue from "../models/Issue.js";
import PendingMessage from "../models/PendingMessages.js";

//save pending message from Dahab
export const recieveMessage = async (req, res) => {
  try {
    const { issueId, message, serviceProvider } = req.body;
    const issue = await Issue.findById(issueId)
      .populate("issue", "issueType")
      .populate("user", "clientName")
      .populate("miner", "model serialNumber");
    if (!issue) throw new NotFoundError("No issue found");
    const newPending = await PendingMessage.create({
      message: message,
      issue: issueId,
      issueType: issue.issue.issueType,
      clientName: issue.user.clientName,
      miner: issue.miner.model,
      serialNumber: issue.miner.serialNumber,
      sendBy: serviceProvider,
      status: "Pending",
    });
    res.status(200).json({ message: "success" });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.msg || error.message });
  }
};
