import express from "express";
import { getDatabaseOverview } from "../../controllers/databaseController.js";

const router = express.Router();

router.get("/database/overview", getDatabaseOverview);

export default router;
