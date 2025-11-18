import { Router } from "express";
import {
  addIssueType,
  getAllIssueTypes,
} from "../controllers/adminIssueController.js";
import { validateAddIssueType } from "../middlewares/validationMiddleware.js";

const router = Router();

router.post("/type", validateAddIssueType, addIssueType);
router.get("/type", getAllIssueTypes);

export default router;
