import pool from "../index.js";

// addItem, getAllItems, deleteItem

export async function createItem(name: string, price: number, stock: number) {
    const query = `
        INSERT INTO items
        VALUES ($1,$2,$3)
        RETURNING id,name,price,stock;
    `;
    const result = await pool.query(query, [name, price, stock]);
    return result.rows[0];
}

export async function getAllItems() {
    const query = `
        SELECT id,name,price,stock
        FROM items;
    `;
    const result = await pool.query(query);
    return result.rows;
}

export async function removeItem(id: string) {
    const query = `
        DELETE FROM items
        WHERE id = $1
        RETURNING id,name,price,stock;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
}
