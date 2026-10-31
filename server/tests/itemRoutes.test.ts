import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../src/db/queries/itemQueries.js", () => ({
    createItem: vi.fn(),
    getAllItems: vi.fn(),
    getItemDetails: vi.fn(),
    getLowStockItems: vi.fn(),
    removeItem: vi.fn(),
    searchItemsByName: vi.fn(),
    updateItem: vi.fn(),
}));

import * as queries from "../src/db/queries/itemQueries.js";
import itemRoutes from "../src/routes/item.js";

const q = vi.mocked(queries);

const app = express();
app.use(express.json());
app.use("/items", itemRoutes);

beforeEach(() => {
    vi.resetAllMocks();
});

describe("item routes", () => {
    it("GET /items/search is not captured by /:id", async () => {
        q.searchItemsByName.mockResolvedValue([{ id: "1", name: "Pen" }]);

        const res = await request(app).get("/items/search?q=pen");

        expect(res.status).toBe(200);
        expect(q.searchItemsByName).toHaveBeenCalledWith("pen");
        expect(q.getItemDetails).not.toHaveBeenCalled();
    });

    it("GET /items/low-stock is not captured by /:id", async () => {
        q.getLowStockItems.mockResolvedValue([]);

        const res = await request(app).get("/items/low-stock?threshold=3");

        expect(res.status).toBe(200);
        expect(q.getLowStockItems).toHaveBeenCalledWith(3);
        expect(q.getItemDetails).not.toHaveBeenCalled();
    });

    it("GET /items/:id returns item details", async () => {
        q.getItemDetails.mockResolvedValue({ id: "abc", name: "Pen" });

        const res = await request(app).get("/items/abc");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: "abc", name: "Pen" });
    });

    it("PATCH /items/:id updates an item", async () => {
        q.updateItem.mockResolvedValue({ id: "abc", price: 30 });

        const res = await request(app).patch("/items/abc").send({ price: 30 });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: "abc", price: 30 });
    });

    it("PATCH /items/:id with no JSON body returns 400", async () => {
        const res = await request(app).patch("/items/abc");

        expect(res.status).toBe(400);
    });

    it("DELETE /items/:id returns 404 for unknown item", async () => {
        q.removeItem.mockResolvedValue(undefined);

        const res = await request(app).delete("/items/nope");

        expect(res.status).toBe(404);
    });
});
