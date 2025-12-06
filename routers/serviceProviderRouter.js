import { Router } from "express";
import { recieveMessage } from "../controllers/serviceProviderController.js";
import { validateRecieveMessage } from "../middlewares/validationMiddleware.js";

const router = Router();

router.post("/receive-message", validateRecieveMessage, recieveMessage);

export default router;
