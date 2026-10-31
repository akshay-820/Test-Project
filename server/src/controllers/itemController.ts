import express from "express";
import {
    createItem,
    getAllItems,
    getItemDetails,
    getLowStockItems,
    removeItem,
    searchItemsByName,
    updateItem,
} from "../db/queries/itemQueries.js";

const addItemToCart = async (req: express.Request, res: express.Response) => {
    try {
        const { name, price, stock } = req.body;

        if (!name || !price || !stock) {
            return res.status(400).json({ error: "Missing data" });
        }

        const result = await createItem(name, price, stock);

        return res.status(201).json(result);
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
            return res.status(400).json({ message: "Invalid itemId" });
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

const itemDetails = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({ message: "Invalid itemId" });
        }

        const result = await getItemDetails(id);

        if (!result) {
            return res.status(404).json({ error: "Item not found" });
        }

        return res.status(200).json(result);
    } catch (err) {
        console.error("Error while getting item details", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const updateCartItem = async (req: express.Request, res: express.Response) => {
    try {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({ message: "Invalid itemId" });
        }

        const { name, price, stock } = req.body ?? {};

        if (name === undefined && price === undefined && stock === undefined) {
            return res.status(400).json({ error: "Nothing to update" });
        }

        if (name !== undefined && (typeof name !== "string" || !name.trim())) {
            return res.status(400).json({ error: "Invalid name" });
        }

        for (const [key, value] of Object.entries({ price, stock })) {
            if (
                value !== undefined &&
                (!Number.isInteger(value) || value < 0)
            ) {
                return res.status(400).json({ error: `Invalid ${key}` });
            }
        }

        const result = await updateItem(id, { name, price, stock });

        if (!result) {
            return res.status(404).json({ error: "Item not found" });
        }

        return res.status(200).json(result);
    } catch (err) {
        console.error("Error while updating item", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const searchItems = async (req: express.Request, res: express.Response) => {
    try {
        const { q } = req.query;

        if (typeof q !== "string" || !q.trim()) {
            return res.status(400).json({ error: "Missing search query" });
        }

        const result = await searchItemsByName(q.trim());
        return res.status(200).json(result);
    } catch (err) {
        console.error("Error while searching items", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const lowStockItems = async (req: express.Request, res: express.Response) => {
    try {
        const { threshold } = req.query;
        const value = threshold === undefined ? 5 : Number(threshold);

        if (!Number.isInteger(value) || value < 0) {
            return res.status(400).json({ error: "Invalid threshold" });
        }

        const result = await getLowStockItems(value);
        return res.status(200).json(result);
    } catch (err) {
        console.error("Error while getting low stock items", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export {
    addItemToCart,
    getCartItems,
    removeItemFromCart,
    itemDetails,
    updateCartItem,
    searchItems,
    lowStockItems,
};
