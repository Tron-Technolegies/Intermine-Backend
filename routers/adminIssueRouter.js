import { Router } from "express";
import {
  addIssueType,
  addNewIssue,
  getAllIssues,
  getAllIssueTypes,
} from "../controllers/adminIssueController.js";
import {
  validateAddIssue,
  validateAddIssueType,
} from "../middlewares/validationMiddleware.js";

const router = Router();

router.post("/type", validateAddIssueType, addIssueType);
router.get("/type", getAllIssueTypes);
router.post("/", validateAddIssue, addNewIssue);
router.get("/", getAllIssues);

export default router;
