import { NotFoundError } from "../errors/customErrors.js";
import IssueType from "../models/IssueType.js";

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
