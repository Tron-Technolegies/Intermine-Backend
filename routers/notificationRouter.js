import { Router } from "express";
import {
  clearAllNotificationByClient,
  clearSingleNotification,
  getAllAdminNotification,
  getUserNotifications,
  markAllAsReadByAdmin,
} from "../controllers/notificationController.js";
import { isAdmin } from "../middlewares/authMiddleWare.js";

const router = Router();

router.get("/user", getUserNotifications);
router.patch("/user/all", clearAllNotificationByClient);
router.patch("/user/:id", clearSingleNotification);
router.get("/admin", isAdmin, getAllAdminNotification);
router.patch("/admin/all", isAdmin, markAllAsReadByAdmin);

export default router;
