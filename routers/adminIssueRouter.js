import { Router } from "express";
import {
  addIssueType,
  addNewIssue,
  getAllIssues,
  getAllIssueTypes,
  updateIssueStatus,
} from "../controllers/adminIssueController.js";
import {
  validateAddIssue,
  validateAddIssueType,
  validateStatusChange,
} from "../middlewares/validationMiddleware.js";

const router = Router();

router.post("/type", validateAddIssueType, addIssueType);
router.get("/type", getAllIssueTypes);
router.post("/", validateAddIssue, addNewIssue);
router.get("/", getAllIssues);
router.patch("/update-status/:id", validateStatusChange, updateIssueStatus);

export default router;
