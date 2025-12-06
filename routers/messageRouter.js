import { Router } from "express";
import {
  cancelPendingMessage,
  editPendingMessage,
  getMessagesForAnIssue,
  getPendingMessages,
  getSinglePendingMessage,
  releasePendingMessage,
} from "../controllers/messageController.js";
import { isAdmin } from "../middlewares/authMiddleWare.js";
import { validateEditPendingMessage } from "../middlewares/validationMiddleware.js";

const router = Router();

router.get("/pending", isAdmin, getPendingMessages);
router.patch(
  "/pending/edit",
  isAdmin,
  validateEditPendingMessage,
  editPendingMessage
);
router.patch(
  "/pending/cancel",
  isAdmin,
  validateEditPendingMessage,
  cancelPendingMessage
);
router.patch(
  "/pending/release",
  isAdmin,
  validateEditPendingMessage,
  releasePendingMessage
);
router.get("/pending/:id", isAdmin, getSinglePendingMessage);
router.get("/issue/:id", getMessagesForAnIssue);

export default router;
