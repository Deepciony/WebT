import express from "express";
import * as authC from "../../controllers/authController.js";

const router = express.Router();

router.post("/auth/register", authC.register);
router.post("/auth/login", authC.login);
router.put("/auth/password", authC.changePassword);
router.put("/auth/profile", authC.updateProfile);

export default router;
