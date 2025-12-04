import { Router } from "express";
import {
  getAdminStats,
  getGraphStats,
} from "../controllers/adminController.js";

const router = Router();

router.get("/stats", getAdminStats);
router.get("/graph", getGraphStats);

export default router;
