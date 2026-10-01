import express from "express";
import { deleteCartHistory, deleteMember, deleteRow, getDatabaseOverview, updateMemberRole } from "../controllers/databaseController.js";
import { requireAdmin, requireLogin } from "../controllers/authMiddleware.js";

const router = express.Router();

router.get("/database/overview", requireLogin, requireAdmin, getDatabaseOverview);
router.delete("/database/members/:memEmail", requireLogin, deleteMember);
router.delete("/database/carts/:cartId", requireLogin, deleteCartHistory);
router.delete("/database/rows/:table/:id", requireLogin, deleteRow);
router.put("/database/members/:memEmail/role", requireLogin, requireAdmin, updateMemberRole);

export default router;
