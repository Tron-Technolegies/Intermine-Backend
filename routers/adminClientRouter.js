import { Router } from "express";
import { isAdmin } from "../middlewares/authMiddleWare.js";
import {
  addClientNote,
  getAllClients,
  getSingleClient,
} from "../controllers/adminClientController.js";
import { validateAddInternalNote } from "../middlewares/validationMiddleware.js";

const router = Router();

router.get("/all", isAdmin, getAllClients);
router.get("/info/:id", isAdmin, getSingleClient);
router.patch("/add-note", validateAddInternalNote, addClientNote);

export default router;
