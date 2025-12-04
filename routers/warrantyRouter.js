import { Router } from "express";
import {
  getAllWarranties,
  getSingleWarranty,
  getWarrantyStats,
  updateWarranty,
} from "../controllers/warrantyController.js";
import { validateUpdateWarranty } from "../middlewares/validationMiddleware.js";

const router = Router();

router.get("/", getAllWarranties);
router.get("/stats", getWarrantyStats);
router.get("/:id", getSingleWarranty);
router.patch("/", validateUpdateWarranty, updateWarranty);

export default router;
