import express from "express";
import * as productC from "../../controllers/productControler.js";

const router = express.Router();

router.get("/products", productC.getAllProduct);
router.post("/products", productC.createProduct);
router.get("/products/three", productC.getThreeProduct);
router.get("/products/:id", productC.getProductById);
router.put("/products/:id", productC.updateProduct);
router.get("/search/products/:id", productC.getSearchProduct);

export default router;