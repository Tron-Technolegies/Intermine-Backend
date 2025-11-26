import { Router } from "express";
import {
  getAllWarranties,
  getSingleWarranty,
  updateWarranty,
} from "../controllers/warrantyController.js";
import { validateUpdateWarranty } from "../middlewares/validationMiddleware.js";

const router = Router();

router.get("/", getAllWarranties);
router.get("/:id", getSingleWarranty);
router.patch("/", validateUpdateWarranty, updateWarranty);

export default router;
