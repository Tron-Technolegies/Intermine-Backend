import { Router } from "express";
import { getAllOwnedMiners } from "../controllers/minerController.js";

const router = Router();

router.get("/user-miner", getAllOwnedMiners);

export default router;
