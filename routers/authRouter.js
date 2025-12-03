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
  updateAdmninSettings,
  verifyOTP,
} from "../controllers/authController.js";
import { authenticateUser, isAdmin } from "../middlewares/authMiddleWare.js";

const router = Router();

router.post("/register", validateRegisterInput, registerClient);
router.post("/login", validateLoginInput, loginClient);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/verifyOTP", validateVerifyOTP, verifyOTP);
router.post("/reset-password", validateResetPassword, resetPassword);
router.post("/logout", logout);
router.patch(
  "/admin-settings",
  authenticateUser,
  isAdmin,
  updateAdmninSettings
);

export default router;
