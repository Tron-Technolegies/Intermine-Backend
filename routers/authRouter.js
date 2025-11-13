import { Router } from "express";
import {
  validateForgotPassword,
  validateLoginInput,
  validateRegisterInput,
  validateResetPassword,
  validateVerifyOTP,
} from "../middlewares/validationMiddleware.js";
import {
  forgotPassword,
  loginClient,
  logout,
  registerClient,
  resetPassword,
  verifyOTP,
} from "../controllers/authController.js";

const router = Router();

router.post("/register", validateRegisterInput, registerClient);
router.post("/login", validateLoginInput, loginClient);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/verifyOTP", validateVerifyOTP, verifyOTP);
router.post("/reset-password", validateResetPassword, resetPassword);
router.post("/logout", logout);

export default router;
