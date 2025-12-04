import { Router } from "express";
import { isAdmin } from "../middlewares/authMiddleWare.js";
import { getAllUsersDropdown } from "../controllers/dropdownController.js";

const router = Router();

router.get("/users", isAdmin, getAllUsersDropdown);

export default router;
