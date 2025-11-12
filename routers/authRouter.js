import { Router } from "express";
import {
  validateLoginInput,
  validateRegisterInput,
} from "../middlewares/validationMiddleware.js";
import { loginClient, registerClient } from "../controllers/authController.js";

const router = Router();

router.post("/register", validateRegisterInput, registerClient);
router.post("/login", validateLoginInput, loginClient);

export default router;
