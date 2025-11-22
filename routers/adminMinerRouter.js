import { Router } from "express";
import {
  addNewMiner,
  editMiner,
  getAllMiners,
  getASingleMiner,
  getOfflineMiners,
} from "../controllers/adminMinerController.js";
import { validateAddMiner } from "../middlewares/validationMiddleware.js";
import { isAdmin } from "../middlewares/authMiddleWare.js";

const router = Router();

router.get("/", isAdmin, getAllMiners);
router.post("/add", isAdmin, validateAddMiner, addNewMiner);
router.get("/offline", isAdmin, getOfflineMiners);
router.get("/:id", isAdmin, getASingleMiner);
router.patch("/:id", isAdmin, validateAddMiner, editMiner);

export default router;
