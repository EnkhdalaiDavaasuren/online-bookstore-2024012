export interface Env {
  DB: D1Database;
}

export interface BookRecord {
  book_id: number;
  category_id: number;
  title: string;
  author: string;
  isbn: string | null;
  price_cents: number;
  stock: number;
}

export interface CategoryRecord {
  category_id: number;
  name: string;
  description: string | null;
}

export async function listBooks(db: D1Database): Promise<BookRecord[]> {
  const result = await db
    .prepare("SELECT book_id, category_id, title, author, isbn, price_cents, stock FROM books ORDER BY book_id ASC")
    .all<BookRecord>();
  return result.results;
}

export async function listCategories(db: D1Database): Promise<CategoryRecord[]> {
  const result = await db
    .prepare("SELECT category_id, name, description FROM categories ORDER BY category_id ASC")
    .all<CategoryRecord>();
  return result.results;
}

export async function getBookById(db: D1Database, id: string): Promise<BookRecord | null> {
  return db
    .prepare("SELECT book_id, category_id, title, author, isbn, price_cents, stock FROM books WHERE book_id = ?")
    .bind(id)
    .first<BookRecord>();
}

export async function searchBooks(db: D1Database, query: string): Promise<BookRecord[]> {
  const result = await db.prepare([
    "SELECT book_id, category_id, title, author, isbn, price_cents, stock",
    "FROM books",
    "WHERE instr(lower(title), lower(?)) > 0",
    "OR instr(lower(author), lower(?)) > 0",
    "ORDER BY book_id ASC",
    "LIMIT 10",
  ].join(" ")).bind(query, query).all<BookRecord>();
  return result.results;
}
