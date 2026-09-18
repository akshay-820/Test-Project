import { Router } from "express";
import {
    addItemToCart,
    getCartItems,
    removeItemFromCart,
} from "../controllers/itemController.js";

const router = Router();

router.get("/", getCartItems);
router.post("/", addItemToCart);
router.delete("/:id", removeItemFromCart);

export default router;
