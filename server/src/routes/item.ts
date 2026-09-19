import { Router } from "express";
import {
    addItemToCart,
    getCartItems,
    itemDetails,
    removeItemFromCart,
} from "../controllers/itemController.js";

const router = Router();

router.get("/", getCartItems);
router.get("/:id", itemDetails);
router.post("/", addItemToCart);
router.delete("/:id", removeItemFromCart);

export default router;
