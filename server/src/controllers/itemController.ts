import express from "express";
import {
    createItem,
    getAllItems,
    removeItem,
} from "../db/queries/itemQueries.js";

const addItemToCart = async (req: express.Request, res: express.Response) => {
    try {
        const { name, price, stock } = req.body;
        if (!name || !price || !stock) {
            return res.status(400).json({ error: "Missing data" });
        }

        const result = await createItem(name, price, stock);
        return res.status(201).json({ result });
    } catch (err) {
        console.error("Error while adding item", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getCartItems = async (req: express.Request, res: express.Response) => {
    try {
        const result = await getAllItems();
        return res.status(200).json(result);
    } catch (err) {
        console.error("Error while getting cart items", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const removeItemFromCart = async (
    req: express.Request,
    res: express.Response,
) => {
    try {
        const { id } = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({ message: "Invalid repoId" });
        }
        const result = await removeItem(id);
        if (!result) {
            return res.status(404).json({ error: "Item not found" });
        }
        return res.status(200).json(result);
    } catch (err) {
        console.error("Error while deleting item", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export { addItemToCart, getCartItems, removeItemFromCart };
