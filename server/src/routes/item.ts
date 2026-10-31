import { Router } from "express";
import {
    addItemToCart,
    getCartItems,
    itemDetails,
    lowStockItems,
    removeItemFromCart,
    searchItems,
    updateCartItem,
} from "../controllers/itemController.js";

const router = Router();

router.get("/", getCartItems);
// Static paths must be registered before "/:id" so they aren't treated as ids
router.get("/search", searchItems);
router.get("/low-stock", lowStockItems);
router.get("/:id", itemDetails);
router.post("/", addItemToCart);
router.patch("/:id", updateCartItem);
router.delete("/:id", removeItemFromCart);

export default router;
