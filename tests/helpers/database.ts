import { database } from "../apply-migrations";

export { fetchApi } from "../apply-migrations";

const timestamp = "2026-11-20T00:00:00.000Z";

export async function clearDatabase(): Promise<void> {
  for (const sql of [
    "DELETE FROM order_events",
    "DELETE FROM order_items",
    "DELETE FROM orders",
    "DELETE FROM customers",
    "DELETE FROM books",
    "DELETE FROM categories",
  ]) {
    await database.prepare(sql).run();
  }
}

export function addCategory(id: number, name: string, description: string | null = null): Promise<D1Result> {
  return database.prepare("INSERT INTO categories (category_id, name, description) VALUES (?, ?, ?)")
    .bind(id, name, description).run();
}

export function addBook(id: number, categoryId: number, title: string, author: string, isbn: string | null, priceCents: number, stock: number): Promise<D1Result> {
  return database.prepare("INSERT INTO books (book_id, category_id, title, author, isbn, price_cents, stock) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(id, categoryId, title, author, isbn, priceCents, stock).run();
}

export function addCustomer(id: number, email = "customer-" + id + "@example.test"): Promise<D1Result> {
  return database.prepare("INSERT INTO customers (customer_id, full_name, email, created_at) VALUES (?, ?, ?, ?)")
    .bind(id, "Synthetic Customer " + id, email, timestamp).run();
}

export function addOrder(id: number, customerId: number, requestKey: string, status = "pending"): Promise<D1Result> {
  return database.prepare("INSERT INTO orders (order_id, customer_id, request_key, status, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(id, customerId, requestKey, status, timestamp).run();
}

export function addOrderItem(orderId: number, bookId: number, quantity = 1, unitPriceCents = 1250): Promise<D1Result> {
  return database.prepare("INSERT INTO order_items (order_id, book_id, quantity, unit_price_cents) VALUES (?, ?, ?, ?)")
    .bind(orderId, bookId, quantity, unitPriceCents).run();
}

export function addOrderEvent(id: number, orderId: number, eventType = "created"): Promise<D1Result> {
  return database.prepare("INSERT INTO order_events (order_event_id, order_id, event_type, occurred_at) VALUES (?, ?, ?, ?)")
    .bind(id, orderId, eventType, timestamp).run();
}
