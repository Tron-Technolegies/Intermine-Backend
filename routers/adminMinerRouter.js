import { Router } from "express";
import {
  addNewMiner,
  editMiner,
  getAllMiners,
  getAllMinersbyLocation,
  getASingleMiner,
  getOfflineMiners,
} from "../controllers/adminMinerController.js";
import { validateAddMiner } from "../middlewares/validationMiddleware.js";

const router = Router();

router.get("/", getAllMiners);
router.post("/add", validateAddMiner, addNewMiner);
router.get("/offline", getOfflineMiners);
router.get("/farms", getAllMinersbyLocation);
router.get("/:id", getASingleMiner);
router.patch("/:id", validateAddMiner, editMiner);

export default router;
