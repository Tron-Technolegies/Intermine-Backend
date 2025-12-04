import { Router } from "express";
import {
  getAgreementStats,
  getAllUserAgreements,
  getUserAgreement,
  sendAgreementToUser,
  signTheAgreement,
} from "../controllers/agreementController.js";
import {
  validateSendAgreement,
  validateSignAgreement,
} from "../middlewares/validationMiddleware.js";
import { isAdmin } from "../middlewares/authMiddleWare.js";

const router = Router();

router.get("/", isAdmin, getAllUserAgreements);
router.post("/send", isAdmin, validateSendAgreement, sendAgreementToUser);
router.get("/user", getUserAgreement);
router.patch("/sign", validateSignAgreement, signTheAgreement);
router.get("/stats", isAdmin, getAgreementStats);

export default router;
