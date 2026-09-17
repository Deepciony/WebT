import express from "express";
import { deleteMember, getDatabaseOverview } from "../../controllers/databaseController.js";

const router = express.Router();

router.get("/database/overview", getDatabaseOverview);
router.delete("/database/members/:memEmail", deleteMember);

export default router;
