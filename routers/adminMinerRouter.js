import { Router } from "express";
import {
  addNewMiner,
  getAllMiners,
  getOfflineMiners,
} from "../controllers/adminMinerController.js";
import { validateAddMiner } from "../middlewares/validationMiddleware.js";
import { isAdmin } from "../middlewares/authMiddleWare.js";

const router = Router();

router.get("/", isAdmin, getAllMiners);
router.post("/add", isAdmin, validateAddMiner, addNewMiner);
router.get("/offline", getOfflineMiners);

export default router;
