import pool from "../index.js";

export async function createItem(name: string, price: number, stock: number) {
    const existingQuery = `
        SELECT id, name, price, stock
        FROM items
        WHERE name = $1;
    `;

    const existing = await pool.query(existingQuery, [name]);

    if (existing.rows.length > 0) {
        const updateQuery = `
            UPDATE items
            SET stock = stock + $1,
                price = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE name = $3
            RETURNING id, name, price, stock;
        `;

        const result = await pool.query(updateQuery, [
            stock,
            price,
            name,
        ]);

        return result.rows[0];
    }

    const insertQuery = `
        INSERT INTO items(name, price, stock)
        VALUES ($1, $2, $3)
        RETURNING id, name, price, stock;
    `;

    const result = await pool.query(insertQuery, [name, price, stock]);

    return result.rows[0];
}

export async function getAllItems() {
    const query = `
        SELECT id, name, price
        FROM items;
    `;

    const result = await pool.query(query);
    return result.rows;
}

export async function getItemDetails(id: string) {
    const query = `
        SELECT id, name, price, stock, updated_at
        FROM items
        WHERE id = $1;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
}

export async function removeItem(id: string) {
    const query = `
        DELETE FROM items
        WHERE id = $1
        RETURNING id, name, price, stock;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
}
