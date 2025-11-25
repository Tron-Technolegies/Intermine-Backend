import { Router } from "express";
import {
  addNewMiningFarm,
  editMiningFarm,
  getAllMiningFarms,
} from "../controllers/miningFarmController.js";
import {
  validateAddMiningFarm,
  validateUpdateMiningFarm,
} from "../middlewares/validationMiddleware.js";

const router = Router();

router.get("/", getAllMiningFarms);
router.post("/", validateAddMiningFarm, addNewMiningFarm);
router.patch("/", validateUpdateMiningFarm, editMiningFarm);

export default router;
