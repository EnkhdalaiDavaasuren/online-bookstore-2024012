import { beforeEach, describe, expect, it } from "vitest";
import { addBook, addCategory, clearDatabase, fetchApi } from "../helpers/database";

const fields = ["book_id", "category_id", "title", "author", "isbn", "price_cents", "stock"];

describe("GET /api/books/:id", () => {
  beforeEach(async () => {
    await clearDatabase();
    await addCategory(1, "Databases");
    await addBook(7, 1, "Database Foundations", "Avery Example", null, 2499, 8);
  });

  it("returns the requested book with every approved field", async () => {
    const response = await fetchApi("/api/books/7");
    expect(response.status).toBe(200);
    const book = await response.json() as Record<string, unknown>;
    expect(Object.keys(book).sort()).toEqual([...fields].sort());
    expect(book).toEqual({
      book_id: 7,
      category_id: 1,
      title: "Database Foundations",
      author: "Avery Example",
      isbn: null,
      price_cents: 2499,
      stock: 8,
    });
  });

  it("returns the exact approved JSON error for an unknown ID", async () => {
    const response = await fetchApi("/api/books/999");
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(await response.json()).toEqual({ error: "Book not found" });
  });

  it("binds the path ID as data rather than SQL syntax", async () => {
    const response = await fetchApi("/api/books/7%20OR%201%3D1");
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Book not found" });
  });
});
