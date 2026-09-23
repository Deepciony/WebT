import express from "express";
import { deleteMember, getDatabaseOverview } from "../../controllers/databaseController.js";
import { requireLogin } from "../../controllers/authMiddleware.js";

const router = express.Router();

router.get("/database/overview", requireLogin, getDatabaseOverview);
router.delete("/database/members/:memEmail", requireLogin, deleteMember);

export default router;
