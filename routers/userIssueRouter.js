import { Router } from "express";
import {
  addIssueByClient,
  GetAllIssuesByClient,
  getAllIssueStatsByClient,
  getAllIssueTypes,
} from "../controllers/userIssueController.js";
import { validateAddIssueByClient } from "../middlewares/validationMiddleware.js";

const router = Router();

router.get("/type", getAllIssueTypes);
router.post("/", validateAddIssueByClient, addIssueByClient);
router.get("/", GetAllIssuesByClient);
router.get("/stats", getAllIssueStatsByClient);

export default router;
