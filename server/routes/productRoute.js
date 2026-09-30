import express from "express";
import * as productC from "../controllers/productController.js";
import { requireLogin } from "../controllers/authMiddleware.js";

const router = express.Router();

router.get("/products", productC.getAllProduct);
router.post("/products", requireLogin, productC.createProduct);
router.get("/products/three", productC.getThreeProduct);
router.get("/products/:id/image", productC.getProductImage);
router.post("/products/:id/image", requireLogin, productC.uploadProductImage, productC.uploadProductImageFile);
router.get("/products/:id", productC.getProductById);
router.put("/products/:id", requireLogin, productC.updateProduct);
router.delete("/products/:id", requireLogin, productC.deleteProduct);
router.get("/search/products/:id", productC.getSearchProduct);

export default router;