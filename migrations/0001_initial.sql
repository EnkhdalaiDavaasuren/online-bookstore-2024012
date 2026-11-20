-- Initial normalized schema for the Online Bookstore Lab 1.
-- All monetary amounts are USD integer cents. Payment credentials are not stored.

CREATE TABLE categories (
    category_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE CHECK (length(name) > 0),
    description TEXT
);

CREATE TABLE books (
    book_id INTEGER PRIMARY KEY,
    category_id INTEGER NOT NULL
        REFERENCES categories(category_id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE,
    price_cents INTEGER NOT NULL
        CHECK (typeof(price_cents) = 'integer' AND price_cents >= 0),
    stock INTEGER NOT NULL DEFAULT 0
        CHECK (typeof(stock) = 'integer' AND stock >= 0)
);

CREATE TABLE customers (
    customer_id INTEGER PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
);

CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL
        REFERENCES customers(customer_id) ON DELETE RESTRICT,
    request_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL
        CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TEXT NOT NULL
);

CREATE TABLE order_items (
    order_id INTEGER NOT NULL
        REFERENCES orders(order_id) ON DELETE RESTRICT,
    book_id INTEGER NOT NULL
        REFERENCES books(book_id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL
        CHECK (typeof(quantity) = 'integer' AND quantity > 0),
    unit_price_cents INTEGER NOT NULL
        CHECK (typeof(unit_price_cents) = 'integer' AND unit_price_cents >= 0),
    PRIMARY KEY (order_id, book_id)
);

CREATE TABLE order_events (
    order_event_id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL
        REFERENCES orders(order_id) ON DELETE RESTRICT,
    event_type TEXT NOT NULL
        CHECK (event_type IN ('created', 'confirmed', 'cancelled')),
    occurred_at TEXT NOT NULL
);

CREATE INDEX idx_books_category_id ON books(category_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_book_id ON order_items(book_id);
CREATE INDEX idx_order_events_order_id ON order_events(order_id);
