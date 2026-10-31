import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/db/index.js", () => ({
    default: { query: vi.fn() },
}));

import pool from "../src/db/index.js";
import {
    getAllItems,
    getItemDetails,
    getLowStockItems,
    removeItem,
    searchItemsByName,
    updateItem,
} from "../src/db/queries/itemQueries.js";

const query = vi.mocked(pool.query) as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
    query.mockReset();
});

describe("getAllItems", () => {
    it("returns all rows", async () => {
        const rows = [{ id: "1", name: "Pen", price: 10 }];
        query.mockResolvedValue({ rows });

        await expect(getAllItems()).resolves.toEqual(rows);
    });
});

describe("getItemDetails", () => {
    it("queries by id and returns the first row", async () => {
        const row = { id: "1", name: "Pen" };
        query.mockResolvedValue({ rows: [row] });

        await expect(getItemDetails("1")).resolves.toEqual(row);
        expect(query.mock.calls[0]?.[1]).toEqual(["1"]);
    });

    it("returns undefined when not found", async () => {
        query.mockResolvedValue({ rows: [] });

        await expect(getItemDetails("missing")).resolves.toBeUndefined();
    });
});

describe("removeItem", () => {
    it("returns the deleted row", async () => {
        const row = { id: "1", name: "Pen" };
        query.mockResolvedValue({ rows: [row] });

        await expect(removeItem("1")).resolves.toEqual(row);
    });
});

describe("updateItem", () => {
    it("passes null for fields that were not provided", async () => {
        query.mockResolvedValue({ rows: [{ id: "1" }] });

        await updateItem("1", { price: 25 });

        expect(query.mock.calls[0]?.[1]).toEqual([null, 25, null, "1"]);
    });

    it("keeps a stock of 0 instead of treating it as missing", async () => {
        query.mockResolvedValue({ rows: [{ id: "1" }] });

        await updateItem("1", { stock: 0 });

        expect(query.mock.calls[0]?.[1]).toEqual([null, null, 0, "1"]);
    });

    it("returns undefined when no row matched", async () => {
        query.mockResolvedValue({ rows: [] });

        await expect(updateItem("x", { name: "A" })).resolves.toBeUndefined();
    });
});

describe("searchItemsByName", () => {
    it("wraps the term in wildcards", async () => {
        query.mockResolvedValue({ rows: [] });

        await searchItemsByName("pen");

        expect(query.mock.calls[0]?.[1]).toEqual(["%pen%"]);
    });
});

describe("getLowStockItems", () => {
    it("passes the threshold through", async () => {
        const rows = [{ id: "1", stock: 2 }];
        query.mockResolvedValue({ rows });

        await expect(getLowStockItems(3)).resolves.toEqual(rows);
        expect(query.mock.calls[0]?.[1]).toEqual([3]);
    });
});
