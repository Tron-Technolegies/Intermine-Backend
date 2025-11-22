import { Router } from "express";
import {
  addIssueByClient,
  GetAllIssuesByClient,
  getAllIssueStatsByClient,
  getAllIssueTypes,
  requestPoolChange,
} from "../controllers/userIssueController.js";
import {
  validateAddIssueByClient,
  validatePoolChangeRequest,
} from "../middlewares/validationMiddleware.js";

const router = Router();

router.get("/type", getAllIssueTypes);
router.post("/", validateAddIssueByClient, addIssueByClient);
router.get("/", GetAllIssuesByClient);
router.get("/stats", getAllIssueStatsByClient);
router.post("/pool-change", validatePoolChangeRequest, requestPoolChange);

export default router;
