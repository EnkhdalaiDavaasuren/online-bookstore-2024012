# Quickstart: Catalog and Search Verification

This guide uses only local Wrangler D1 state for bookstore-db-3. Do not use remote D1, deploy, or enter real customer/payment information.

## Prerequisites

- Node.js and npm installed.
- Project dependencies installed with npm install.
- The Worker is configured with the D1 binding DB and database name bookstore-db-3 in wrangler.jsonc.

## Apply schema and synthetic catalog data locally

From the repository root, run:

    npm run db:migrate:local
    npm run db:seed:local
    npx wrangler d1 execute bookstore-db-3 --local --command="PRAGMA foreign_key_check;"

The initial migration creates all six required tables. The seed file contains only synthetic categories and books. Do not run Wrangler commands without --local for this feature.

## Run automated tests

Run the type check and the complete Vitest suite:

    npm run typecheck
    npx vitest run

The suite covers database constraints and every approved API acceptance criterion, including list/detail/search/category response shapes, ordering, error cases, and search-route precedence.

## Run the Worker locally

Start the local Worker:

    npm run dev

Wrangler serves the Worker at http://127.0.0.1:8787 by default. Verify these GET routes:

- GET /api/books — all books, ascending book_id, no pagination or result cap.
- GET /api/books/{id} — one book; an unknown ID returns HTTP 404 with exactly {"error":"Book not found"}.
- GET /api/books/search?q=database — ASCII case-insensitive title/author substring search, ascending book_id, first 10 matches.
- GET /api/categories — all categories, ascending category_id, no pagination or result cap.

Search with missing q, empty q=, or q consisting only of whitespace must return HTTP 400 with the existing JSON error object. Per approved CHG-001, leading/trailing whitespace is trimmed before matching; no other query normalization is performed.

Example PowerShell requests:

    Invoke-RestMethod http://127.0.0.1:8787/api/books
    Invoke-RestMethod http://127.0.0.1:8787/api/books/1
    Invoke-RestMethod 'http://127.0.0.1:8787/api/books/search?q=database'
    Invoke-RestMethod http://127.0.0.1:8787/api/categories

Record actual migration, test, and API command output in the Verification Results section after execution. Do not report planned output as test evidence.

## Verification Results

Verified locally on 2026-11-20 against D1 `bookstore-db-3` only. No remote D1, deployment, or GitHub push was used.

### T013 — Local D1 schema, seed, integrity

- `npm run db:migrate:local` exited 0. Wrangler reported `Resource location: local` and `No migrations to apply!` (the migration was already recorded locally).
- `npm run db:seed:local` was attempted once and exited 1 with `UNIQUE constraint failed: categories.category_id`. No reset/drop/overwrite was performed.
- Read-only inspection using `npx wrangler d1 execute bookstore-db-3 --local --command=...` listed the six expected tables: `categories`, `books`, `customers`, `orders`, `order_items`, and `order_events` (plus Wrangler bookkeeping table `d1_migrations`). The query returned 3 categories and 14 books. All rows matched the corresponding values in `sql/seed.sql`: categories IDs 1–3; books IDs 1–14, including category, title, author, ISBN, integer-cent price, and stock. Thus the seed data was already fully applied; the failed insert conflicted with those existing rows.
- `PRAGMA foreign_key_check` returned `[]` (no violations). The query command exited 0 and Wrangler reported `4 commands executed successfully`.
- Database constraints were exercised by the full integration suite: `tests/integration/database.test.ts` passed all 5 tests covering the approved integrity constraints.

### T014 — Automated tests

- `npx vitest run` exited 0: **5 test files passed; 23 tests passed**. File counts: book-details 3, categories 3, books-list 4, search 8, database integrity 5. This is the acceptance-criteria test evidence for search, list, detail, and categories.
- `npm run typecheck` (`tsc --noEmit`) exited 0.

### T015 — Local HTTP verification

Started with `npm run dev -- --ip 127.0.0.1`. Wrangler reported `env.DB (bookstore-db-3) D1 Database local` and `Ready on http://127.0.0.1:8787`. `curl.exe -sS -i` returned:

- `GET /api/books` — **200**, JSON array of all 14 seeded books in ascending `book_id`; each object has the seven approved fields.
- `GET /api/books/1` — **200**, `{"book_id":1,"category_id":1,"title":"Database Foundations","author":"Avery Example","isbn":"9780000000001","price_cents":2499,"stock":8}`.
- `GET /api/books/search?q=database` — **200**, JSON array of the first 10 matching books (IDs 1–10), showing the static search route is handled as search rather than as a dynamic ID.
- `GET /api/categories` — **200**, `[{"category_id":1,"name":"Databases","description":"Synthetic database and data-modeling titles"},{"category_id":2,"name":"Computing","description":"Synthetic general computing titles"},{"category_id":3,"name":"Literature","description":"Synthetic fiction titles"}]`.
- `GET /api/books/search` and `GET /api/books/search?q=` — **400** for both, each with `{"error":"Search query is required"}`.
- Control check `GET /api/books/9999` — **404**, exactly `{"error":"Book not found"}`.

The server was bound to loopback only.

### CHG-001 — Search whitespace regression verification (2026-11-20)

- Before implementation, the local Worker returned HTTP 200 with 10 ordered book records for `GET /api/books/search?q=database`, but HTTP 200 with `[]` for `GET /api/books/search?q=%20%20database%20%20`.
- The AC-SEARCH-06 regression was run before the handler change and failed as expected: the padded query returned `[]` instead of the plain query results.
- After trimming q in the search route, `npx vitest run` exited 0: **5 files passed, 24 tests passed**, including **9 search tests**. `npm run typecheck` (`tsc --noEmit`) exited 0.
- With `npm run dev -- --ip 127.0.0.1` using local D1 `bookstore-db-3`, both `GET /api/books/search?q=database` and `GET /api/books/search?q=%20%20database%20%20` returned HTTP **200**. A PowerShell check of `curl.exe` response bodies printed `EXACT_BODY_MATCH: True`; each body contained 10 books in IDs 1–10 ascending.
- `GET /api/books/search?q=%20%20%20` returned HTTP **400** with `{"error":"Search query is required"}`. The Worker was stopped after verification. No schema or migration changes were made.
## CHG-008 verification on November 27, 2026

- `npm run generate-types`, `npm run typecheck`, and `npm run build` passed. esbuild emitted `public/assets/app.js`.
- `npm test` passed 26 Worker/D1 tests and 2 React UI tests. The Miniflare integration harness sets a disposable persistence directory per suite and applies the migration to each isolated database.
- Local Wrangler executed `SELECT 1 AS ok`, the database search query, and `PRAGMA foreign_key_check`. The results were 1, book IDs 1–10, and zero violation rows.
- Chrome verified 14 initial catalog cards, the health status, 10 padded-query matches whose titles matched the API response, the detail view, restoration of the search results, the empty state, and restoration of the full catalog. Browser requests returned HTTP 200 and there were zero page errors.
- The convergence review found local evidence for AC-HEALTH-01, AC-UI-01 through AC-UI-03, and the existing catalog acceptance criteria. See `docs/traceability.md` and `docs/llm-wiki/wiki/evidence/`.
