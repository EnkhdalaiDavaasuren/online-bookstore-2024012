import { beforeEach, describe, expect, it } from "vitest";
import { addBook, addCategory, clearDatabase, fetchApi } from "../helpers/database";

const bookFields = ["book_id", "category_id", "title", "author", "isbn", "price_cents", "stock"];

async function seedSearchBooks(): Promise<void> {
  await addCategory(1, "Databases");
  await addBook(1, 1, "Database Systems", "Avery Example", null, 2499, 8);
  await addBook(2, 1, "Query Design", "Database Scholar", "9780000000002", 3199, 5);
  await addBook(3, 1, "Algorithms", "Casey Demo", "9780000000003", 4299, 4);
}

async function responseBooks(path: string): Promise<Record<string, unknown>[]> {
  const response = await fetchApi(path);
  expect(response.status).toBe(200);
  return response.json() as Promise<Record<string, unknown>[]>;
}

describe("GET /api/books/search", () => {
  beforeEach(async () => {
    await clearDatabase();
    await seedSearchBooks();
  });

  it("AC-SEARCH-01 matches title or author substrings and orders by book ID", async () => {
    const books = await responseBooks("/api/books/search?q=database");
    expect(books.map((book) => book.book_id)).toEqual([1, 2]);
  });

  it("AC-SEARCH-02 returns the same ordered results for ASCII case variants", async () => {
    const lower = await responseBooks("/api/books/search?q=database");
    const upper = await responseBooks("/api/books/search?q=DATABASE");
    expect(upper).toEqual(lower);
  });

  it("AC-SEARCH-03 returns an empty list when nothing matches", async () => {
    expect(await responseBooks("/api/books/search?q=unknown-book-xyz")).toEqual([]);
  });

  it("AC-SEARCH-04 returns at most the first ten matches by ascending book ID", async () => {
    await clearDatabase();
    await addCategory(1, "Databases");
    for (let id = 12; id >= 1; id -= 1) {
      await addBook(id, 1, "Database Volume " + id, "Synthetic Author", "9780000001" + String(id).padStart(2, "0"), 1000 + id, id);
    }

    const books = await responseBooks("/api/books/search?q=database");
    expect(books).toHaveLength(10);
    expect(books.map((book) => book.book_id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("AC-SEARCH-05 returns HTTP 400 and a JSON error for missing and empty q", async () => {
    for (const query of ["", "?q="]) {
      const response = await fetchApi("/api/books/search" + query);
      expect(response.status).toBe(400);
      expect(response.headers.get("content-type")).toContain("application/json");
      const body = await response.json() as Record<string, unknown>;
      expect(typeof body.error).toBe("string");
    }
  });

  it("AC-SEARCH-06 trims surrounding whitespace and preserves the exact ordered results", async () => {
    const plain = await responseBooks("/api/books/search?q=database");
    const padded = await responseBooks("/api/books/search?q=%20%20database%20%20");
    expect(padded).toEqual(plain);
    expect(padded.map((book) => book.book_id)).toEqual([1, 2]);

    const whitespaceOnly = await fetchApi("/api/books/search?q=%20%20%20");
    expect(whitespaceOnly.status).toBe(400);
    expect(await whitespaceOnly.json()).toEqual({ error: "Search query is required" });
  });

  it("returns the complete approved book fields, preserving a null ISBN", async () => {
    const books = await responseBooks("/api/books/search?q=database");
    expect(Object.keys(books[0] ?? {}).sort()).toEqual([...bookFields].sort());
    expect(books[0]?.isbn).toBeNull();
  });

  it("matches wildcard characters literally and binds hostile query text as data", async () => {
    await addBook(4, 1, "Percent % Title", "Writer", null, 100, 1);
    await addBook(5, 1, "Percent X Title", "Writer", null, 100, 1);
    const percent = await responseBooks("/api/books/search?q=%25");
    expect(percent.map((book) => book.book_id)).toEqual([4]);

    const hostile = await responseBooks("/api/books/search?q=%27%20OR%201%3D1%20--");
    expect(hostile).toEqual([]);
  });

  it("routes the static search path before the dynamic book-ID path", async () => {
    const response = await fetchApi("/api/books/search?q=database");
    expect(response.status).toBe(200);
    expect(await response.json()).toHaveLength(2);
  });
});
