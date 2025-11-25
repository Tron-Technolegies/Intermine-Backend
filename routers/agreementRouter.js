import { Router } from "express";
import {
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

export default router;
