import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { App } from "../../client/App";

const book = {
  book_id: 1, category_id: 1, title: "Database Foundations", author: "A. Smith",
  price_cents: 3900, stock: 0, isbn: "9780000000001",
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("loads D1 status and catalog, searches, opens detail, and restores results", async () => {
  const fetch = vi.fn(async (path: string) => {
    if (path === "/api/health") return Response.json({ status: "ok", database: { ok: 1 } });
    if (path === "/api/books/1") return Response.json(book);
    if (path === "/api/books/search?q=unknown") return Response.json([]);
    return Response.json([book]);
  });
  vi.stubGlobal("fetch", fetch);
  render(<App />);
  expect(screen.getByText("Loading books…")).toBeTruthy();
  expect(await screen.findByText("Database connected")).toBeTruthy();
  expect(await screen.findByText("$39.00 · Sold out")).toBeTruthy();
  const search = screen.getByRole("searchbox");
  fireEvent.change(search, { target: { value: "database" } });
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
  expect(await screen.findByRole("heading", { name: book.title })).toBeTruthy();
  expect(fetch.mock.calls.map(call => call[0])).toContain("/api/books/search?q=database");
  fireEvent.click(screen.getByRole("button", { name: /View details/ }));
  expect(await screen.findByText(`ISBN ${book.isbn}`)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Back to results" }));
  expect(screen.getByRole("heading", { name: book.title })).toBeTruthy();
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "unknown" } });
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
  expect(await screen.findByText("No books found.")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Show all books" }));
  expect(await screen.findByRole("heading", { name: book.title })).toBeTruthy();
});

it("displays API errors and an unavailable database", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ error: "Service unavailable" }, { status: 503 })));
  render(<App />);
  expect((await screen.findByRole("alert")).textContent).toBe("Service unavailable");
  expect(await screen.findByText("Database unavailable")).toBeTruthy();
});
