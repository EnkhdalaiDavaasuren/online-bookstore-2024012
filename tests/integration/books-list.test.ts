import { beforeEach, describe, expect, it } from "vitest";
import { addBook, addCategory, clearDatabase, fetchApi } from "../helpers/database";

const fields = ["book_id", "category_id", "title", "author", "isbn", "price_cents", "stock"];

async function getBooks(): Promise<Record<string, unknown>[]> {
  const response = await fetchApi("/api/books");
  expect(response.status).toBe(200);
  return response.json() as Promise<Record<string, unknown>[]>;
}

async function addCatalogFixtures(): Promise<void> {
  await addCategory(2, "Computing");
  await addCategory(1, "Databases");
  await addBook(8, 2, "Systems", "A. Example", "9780000000008", 1800, 2);
  await addBook(2, 1, "Database Basics", "B. Example", null, 2500, 5);
  await addBook(5, 2, "Algorithms", "C. Example", "9780000000005", 3100, 1);
}

describe("GET /api/books", () => {
  beforeEach(async () => {
    await clearDatabase();
    await addCatalogFixtures();
  });

  it("returns every book once in ascending book_id order without a result cap", async () => {
    const books = await getBooks();
    expect(books.map((book) => book.book_id)).toEqual([2, 5, 8]);
    expect(books).toHaveLength(3);
  });

  it("returns [] when the catalog is empty", async () => {
    await clearDatabase();
    expect(await getBooks()).toEqual([]);
  });

  it("returns more than ten books when the catalog has more than ten", async () => {
    await clearDatabase();
    await addCategory(1, "Databases");
    for (let id = 15; id >= 1; id -= 1) {
      await addBook(id, 1, "Synthetic Book " + id, "Synthetic Author", null, id * 100, id);
    }
    const books = await getBooks();
    expect(books).toHaveLength(15);
    expect(books.map((book) => book.book_id)).toEqual(Array.from({ length: 15 }, (_, index) => index + 1));
  });

  it("includes all approved book fields and keeps a missing ISBN as null", async () => {
    const books = await getBooks();
    expect(Object.keys(books[0] ?? {}).sort()).toEqual([...fields].sort());
    expect(books.find((book) => book.book_id === 2)?.isbn).toBeNull();
  });
});
