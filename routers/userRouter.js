import { Router } from "express";
import {
  getUserInfo,
  updatePersonalInfo,
  updateUserAddress,
} from "../controllers/userController.js";
import {
  validateUpdateAddress,
  validateUpdateProfile,
} from "../middlewares/validationMiddleware.js";
import { isAdmin } from "../middlewares/authMiddleWare.js";

const router = Router();

router.get("/info", getUserInfo);
router.patch("/personal", validateUpdateProfile, updatePersonalInfo);
router.patch("/address", validateUpdateAddress, updateUserAddress);

export default router;
