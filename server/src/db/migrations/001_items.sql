CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    price INTEGER NOT NULL,
    stock INTEGER NOT NULL
);