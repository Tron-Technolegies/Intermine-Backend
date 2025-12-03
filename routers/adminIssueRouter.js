import { Router } from "express";
import {
  addIssueType,
  addNewIssue,
  editIssueType,
  getAllIssues,
  getAllIssueTypes,
  getIssueMessages,
  sendReminderToDahab,
  sendResponseToClient,
  updateIssueStatus,
} from "../controllers/adminIssueController.js";
import {
  validateAddIssue,
  validateAddIssueType,
  validateDahabReminder,
  validateEditIssueType,
  validateSendResponse,
  validateStatusChange,
} from "../middlewares/validationMiddleware.js";

const router = Router();

router.post("/type", validateAddIssueType, addIssueType);
router.get("/type", getAllIssueTypes);
router.patch("/type", validateEditIssueType, editIssueType);
router.post("/", validateAddIssue, addNewIssue);
router.get("/", getAllIssues);
router.patch("/update-status/:id", validateStatusChange, updateIssueStatus);
router.patch("/dahab-reminder", validateDahabReminder, sendReminderToDahab);
router.patch("/send-response", validateSendResponse, sendResponseToClient);
router.get("/issue-messages/:id", getIssueMessages);

export default router;
