import axios from "axios";
import { DAHAB_URL } from "../utils/urls.js";
import Issue from "../models/Issue.js";
import { NotFoundError } from "../errors/customErrors.js";

//get pending messages
export const getPendingMessages = async (req, res) => {
  try {
    const { currentPage, query } = req.query;
    const { data } = await axios.get(`${DAHAB_URL}/pending`, {
      params: { currentPage, query },
      headers: {
        "x-api-key": process.env.DAHAB_API_KEY,
      },
    });
    res.status(200).json(data);
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
