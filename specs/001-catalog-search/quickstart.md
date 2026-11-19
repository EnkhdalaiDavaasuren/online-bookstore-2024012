# Quickstart: Catalog and Search Validation

This guide describes validation to run after implementation and migration approval. It has not been executed; no migration or application code exists from this planning task.

## Prerequisites

- Node.js and the project’s approved package dependencies installed.
- Wrangler available through the project’s package tooling.
- Cloudflare Workers local development configured with the D1 binding DB; validation must use local D1 only.
- The approved initial schema migration at migrations/0001_initial.sql and synthetic test fixtures.

## Validate the initial schema locally

1. Apply the migration to the local D1 database:

       npx wrangler d1 execute bookstore-db-3 --local --file=./migrations/0001_initial.sql

2. Check foreign-key integrity:

       npx wrangler d1 execute bookstore-db-3 --local --command="PRAGMA foreign_key_check;"

3. Run tests that attempt invalid foreign keys, negative stock, negative prices, zero/negative quantity, duplicate request_key, and duplicate order/book lines. Each invalid write must be rejected by a database constraint.

## Validate the Worker API

1. Start the local Worker with Wrangler dev after implementation.
2. Use synthetic catalog rows only; do not enter real payment data.
3. Verify GET /api/books returns all seeded books once, sorted by ascending book_id, without a cap.
4. Verify GET /api/books/search?q=database and q=DATABASE return the same ASCII case-insensitive substring matches, sorted by book_id.
5. Seed more than 10 matching books and verify search returns exactly the first 10 by ascending book_id.
6. Verify an unmatched query returns [] and an empty q returns HTTP 400.
7. Verify GET /api/books/:id returns the expected book and an unknown ID returns HTTP 404 with a JSON error.
8. Verify the static /api/books/search path is routed before /api/books/:id.
9. Verify leading/trailing whitespace behavior only according to CHG-001 after that later approved workflow; do not add trimming to this feature.

## Test command

Run the real project test suite and record the actual output:

       npx vitest run

Do not use remote D1 or deploy as part of local feature validation.
