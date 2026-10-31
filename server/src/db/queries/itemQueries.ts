import pool from "../index.js";

export async function createItem(name: string, price: number, stock: number) {
    const existingQuery = `
        SELECT id, name, price, stock
        FROM items
        WHERE name = $1;
    `;

    const existing = await pool.query(existingQuery, [name]);

    if (existing.rows.length > 0) {
        const currentStock = existing.rows[0].stock;

        // Simulate some processing before updating
        await new Promise((resolve) => setTimeout(resolve, 100));

        const updateQuery = `
            UPDATE items
            SET stock = $1,
                price = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE name = $3
            RETURNING id, name, price, stock;
        `;

        const result = await pool.query(updateQuery, [
            currentStock - stock,
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

export async function updateItem(
    id: string,
    fields: { name?: string; price?: number; stock?: number },
) {
    const query = `
        UPDATE items
        SET name = COALESCE($1, name),
            price = COALESCE($2, price),
            stock = COALESCE($3, stock),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING id, name, price, stock, updated_at;
    `;

    const result = await pool.query(query, [
        fields.name ?? null,
        fields.price ?? null,
        fields.stock ?? null,
        id,
    ]);
    return result.rows[0];
}

export async function searchItemsByName(term: string) {
    const query = `
        SELECT id, name, price
        FROM items
        WHERE name ILIKE $1
        ORDER BY name;
    `;

    const result = await pool.query(query, [`%${term}%`]);
    return result.rows;
}

export async function getLowStockItems(threshold: number) {
    const query = `
        SELECT id, name, price, stock
        FROM items
        WHERE stock <= $1
        ORDER BY stock ASC;
    `;

    const result = await pool.query(query, [threshold]);
    return result.rows;
}
