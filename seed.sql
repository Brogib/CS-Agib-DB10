-- Create tables for SBD Store

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    balance INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price INTEGER NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    total INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample users (passwords are bcrypt hashed with salt round 10)
INSERT INTO users (name, username, email, phone, password, balance) VALUES
('Alice', 'alice', 'alice@example.com', '+1-555-0100', '$2b$10$9DtbGXv7rqf3IXw7LUCSU.3GdeBc6mnOSVqZFvajImIlWS/DW9vC.', 50000),
('Bob', 'bob', 'bob@example.com', '+1-555-0101', '$2b$10$ilibROd7gIHhlQSWQ32n0OdGzPuPYVxQzR3LMfR7WF2GglADcuUWK', 0),
('Charlie', 'charlie', 'charlie@example.com', '+1-555-0102', '$2b$10$Ep/lp/gzriH41bSOQKGCrujr6W5lUBpbdmGupAaMJzoYB2TxGTGYO', 100000);

-- Insert sample items
INSERT INTO items (name, price, stock) VALUES
('Laptop', 1000000, 10),
('Mouse', 50000, 100),
('Keyboard', 150000, 50),
('Monitor', 300000, 20);

-- Insert sample transactions with descriptions
INSERT INTO transactions (user_id, item_id, quantity, total, status, description) VALUES
(1, 1, 1, 1000000, 'paid', 'Beli laptop untuk kerja'),
(1, 2, 2, 100000, 'paid', 'Mouse cadangan'),
(2, 3, 1, 150000, 'pending', 'Keyboard mekanikal'),
(3, 4, 1, 300000, 'pending', 'Monitor 24 inch');