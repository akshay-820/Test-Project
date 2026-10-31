import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockRequest, mockResponse } from "./helpers.js";

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
import {
    addItemToCart,
    getCartItems,
    itemDetails,
    lowStockItems,
    removeItemFromCart,
    searchItems,
    updateCartItem,
} from "../src/controllers/itemController.js";

const q = vi.mocked(queries);

beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("addItemToCart", () => {
    it("creates an item and returns 201", async () => {
        const item = { id: "1", name: "Pen", price: 10, stock: 5 };
        q.createItem.mockResolvedValue(item);
        const res = mockResponse();

        await addItemToCart(
            mockRequest({ body: { name: "Pen", price: 10, stock: 5 } }),
            res,
        );

        expect(q.createItem).toHaveBeenCalledWith("Pen", 10, 5);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(item);
    });

    it("returns 400 when fields are missing", async () => {
        const res = mockResponse();

        await addItemToCart(mockRequest({ body: { name: "Pen" } }), res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(q.createItem).not.toHaveBeenCalled();
    });

    it("returns 500 when the query fails", async () => {
        q.createItem.mockRejectedValue(new Error("db down"));
        const res = mockResponse();

        await addItemToCart(
            mockRequest({ body: { name: "Pen", price: 10, stock: 5 } }),
            res,
        );

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe("getCartItems", () => {
    it("returns all items", async () => {
        q.getAllItems.mockResolvedValue([{ id: "1" }]);
        const res = mockResponse();

        await getCartItems(mockRequest(), res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([{ id: "1" }]);
    });
});

describe("itemDetails", () => {
    it("returns the item", async () => {
        q.getItemDetails.mockResolvedValue({ id: "1" });
        const res = mockResponse();

        await itemDetails(mockRequest({ params: { id: "1" } }), res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 404 when not found", async () => {
        q.getItemDetails.mockResolvedValue(undefined);
        const res = mockResponse();

        await itemDetails(mockRequest({ params: { id: "1" } }), res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});

describe("removeItemFromCart", () => {
    it("returns the removed item", async () => {
        q.removeItem.mockResolvedValue({ id: "1" });
        const res = mockResponse();

        await removeItemFromCart(mockRequest({ params: { id: "1" } }), res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 404 when not found", async () => {
        q.removeItem.mockResolvedValue(undefined);
        const res = mockResponse();

        await removeItemFromCart(mockRequest({ params: { id: "1" } }), res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});

describe("updateCartItem", () => {
    it("updates provided fields", async () => {
        q.updateItem.mockResolvedValue({ id: "1", price: 20 });
        const res = mockResponse();

        await updateCartItem(
            mockRequest({ params: { id: "1" }, body: { price: 20 } }),
            res,
        );

        expect(q.updateItem).toHaveBeenCalledWith("1", {
            name: undefined,
            price: 20,
            stock: undefined,
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("allows setting stock to 0", async () => {
        q.updateItem.mockResolvedValue({ id: "1", stock: 0 });
        const res = mockResponse();

        await updateCartItem(
            mockRequest({ params: { id: "1" }, body: { stock: 0 } }),
            res,
        );

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 400 when body is empty", async () => {
        const res = mockResponse();

        await updateCartItem(mockRequest({ params: { id: "1" } }), res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(q.updateItem).not.toHaveBeenCalled();
    });

    it.each([
        [{ name: "" }, "Invalid name"],
        [{ name: 42 }, "Invalid name"],
        [{ price: -1 }, "Invalid price"],
        [{ price: "10" }, "Invalid price"],
        [{ stock: 1.5 }, "Invalid stock"],
    ])("rejects %o", async (body, error) => {
        const res = mockResponse();

        await updateCartItem(mockRequest({ params: { id: "1" }, body }), res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error });
    });

    it("returns 404 when item does not exist", async () => {
        q.updateItem.mockResolvedValue(undefined);
        const res = mockResponse();

        await updateCartItem(
            mockRequest({ params: { id: "1" }, body: { name: "Pen" } }),
            res,
        );

        expect(res.status).toHaveBeenCalledWith(404);
    });
});

describe("searchItems", () => {
    it("searches by trimmed term", async () => {
        q.searchItemsByName.mockResolvedValue([{ id: "1" }]);
        const res = mockResponse();

        await searchItems(mockRequest({ query: { q: "  pen " } }), res);

        expect(q.searchItemsByName).toHaveBeenCalledWith("pen");
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 400 without a query", async () => {
        const res = mockResponse();

        await searchItems(mockRequest({ query: {} }), res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

describe("lowStockItems", () => {
    it("defaults the threshold to 5", async () => {
        q.getLowStockItems.mockResolvedValue([]);
        const res = mockResponse();

        await lowStockItems(mockRequest(), res);

        expect(q.getLowStockItems).toHaveBeenCalledWith(5);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("uses the provided threshold", async () => {
        q.getLowStockItems.mockResolvedValue([]);
        const res = mockResponse();

        await lowStockItems(mockRequest({ query: { threshold: "2" } }), res);

        expect(q.getLowStockItems).toHaveBeenCalledWith(2);
    });

    it.each(["abc", "-1", "2.5"])(
        "returns 400 for threshold %s",
        async (threshold) => {
            const res = mockResponse();

            await lowStockItems(mockRequest({ query: { threshold } }), res);

            expect(res.status).toHaveBeenCalledWith(400);
        },
    );
});
