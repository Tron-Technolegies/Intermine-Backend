import { Router } from "express";
import {
  getMessagesForAnIssue,
  getPendingMessages,
} from "../controllers/messageController.js";
import { isAdmin } from "../middlewares/authMiddleWare.js";

const router = Router();

router.get("/pending", isAdmin, getPendingMessages);
router.get("/issue/:id", getMessagesForAnIssue);

export default router;
