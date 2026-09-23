import express from "express";
import * as cartC from "../../controllers/cartController.js";

const router = express.Router();

router.post("/carts/chkcart", cartC.chkCart);
router.post("/carts/addcart", cartC.postCart);
router.post("/carts/addcartdtl", cartC.postCartDtl);
router.put("/carts/setcartdtlqty", cartC.setCartDtlQty);
router.get("/carts/sumcart/:id", cartC.sumCart);
router.get("/carts/getcart/:id", cartC.getCart);
router.get("/carts/getcartdtl/:id", cartC.getCartDtl);
router.post("/carts/getcartbycus", cartC.getCartByCus);
router.put("/carts/cfcart/:id", cartC.cfCart);
router.delete("/carts/delcartdtl/:id/:pdId", cartC.delCartDtl);
router.delete("/carts/delcart/:id", cartC.delCart);

export default router;
