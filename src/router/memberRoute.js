import express from "express";
import * as memberC from "../../controllers/memberController.js";
import { requireLogin } from "../../controllers/authMiddleware.js";

const router = express.Router();

router.get("/members/detail", memberC.getMember);
router.get("/members/logout", memberC.logoutMember);
router.put("/members/profile", requireLogin, memberC.updateMember);
router.post("/members", memberC.postMember);
router.post("/members/login", memberC.loginMember);

export default router;
