import express from "express";
import { deleteCartHistory, deleteMember, getDatabaseOverview } from "../../controllers/databaseController.js";
import { requireLogin } from "../../controllers/authMiddleware.js";

const router = express.Router();

router.get("/database/overview", requireLogin, getDatabaseOverview);
router.delete("/database/members/:memEmail", requireLogin, deleteMember);
router.delete("/database/carts/:cartId", requireLogin, deleteCartHistory);

export default router;
