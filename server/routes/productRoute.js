import express from "express";
import * as productC from "../controllers/productController.js";
import { requireAdmin, requireLogin } from "../controllers/authMiddleware.js";

const router = express.Router();

router.get("/products", productC.getAllProduct);
router.post("/products", requireLogin, requireAdmin, productC.createProduct);
router.get("/products/three", productC.getThreeProduct);
router.get("/products/:id/image", productC.getProductImage);
router.post("/products/:id/image", requireLogin, requireAdmin, productC.uploadProductImage, productC.uploadProductImageFile);
router.get("/products/:id", productC.getProductById);
router.put("/products/:id", requireLogin, requireAdmin, productC.updateProduct);
router.delete("/products/:id", requireLogin, requireAdmin, productC.deleteProduct);
router.get("/search/products/:id", productC.getSearchProduct);

export default router;