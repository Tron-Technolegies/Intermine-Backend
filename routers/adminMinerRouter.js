import { Router } from "express";
import {
  addNewMiner,
  getAllMiners,
} from "../controllers/adminMinerController.js";
import { validateAddMiner } from "../middlewares/validationMiddleware.js";
import { isAdmin } from "../middlewares/authMiddleWare.js";

const router = Router();

router.get("/", isAdmin, getAllMiners);
router.post("/add", isAdmin, validateAddMiner, addNewMiner);

export default router;
