import { Router } from "express";
import { isAdmin } from "../middlewares/authMiddleWare.js";
import {
  getAllClients,
  getSingleClient,
} from "../controllers/adminClientController.js";

const router = Router();

router.get("/all", isAdmin, getAllClients);
router.get("/info/:id", isAdmin, getSingleClient);

export default router;
