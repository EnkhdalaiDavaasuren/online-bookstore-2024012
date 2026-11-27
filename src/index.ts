import { getBookById, listBooks, listCategories, searchBooks, type Env } from "./books";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/health") {
      try {
        const database = await env.DB.prepare("SELECT 1 AS ok").first<{ ok: number }>();
        if (database?.ok === 1) {
          return json({ status: "ok", database });
        }
      } catch {
        return json({ error: "Database unavailable" }, 503);
      }
      return json({ error: "Database unavailable" }, 503);
    }

    // Keep this exact static route before the dynamic /api/books/:id path.
    if (path === "/api/books/search") {
      const query = url.searchParams.get("q");
      const normalizedQuery = query?.trim();
      if (!normalizedQuery) {
        return json({ error: "Search query is required" }, 400);
      }
      return json(await searchBooks(env.DB, normalizedQuery));
    }

    if (path === "/api/books") {
      return json(await listBooks(env.DB));
    }

    if (path === "/api/categories") {
      return json(await listCategories(env.DB));
    }

    const bookPathPrefix = "/api/books/";
    if (path.startsWith(bookPathPrefix)) {
      const id = path.slice(bookPathPrefix.length);
      if (id.length > 0 && !id.includes("/")) {
        const book = await getBookById(env.DB, id);
        return book === null ? json({ error: "Book not found" }, 404) : json(book);
      }
    }

    return json({ error: "Not found" }, 404);
  },
};
