# Implementation Plan: Book Catalog and Book Search

**Branch**: main | **Date**: 2026-11-19 | **Spec**: spec.md

**Input**: Approved feature specification at specs/001-catalog-search/spec.md

## Summary

Build the Lab 1 Cloudflare Worker catalog API backed by D1. The initial SQL migration is explicitly required to create all six common bookstore tables. This feature implements only catalog listing, single-book lookup, and ASCII case-insensitive substring search; it does not implement customer/order APIs or checkout. Search uses GET /api/books/search?q=..., returns the first 10 matches ordered by ascending book ID, and does not trim or normalize the query. The complete six-table model and ERD are in data-model.md.

## Technical Context

**Language/Version**: TypeScript (Wrangler configuration points to src/index.ts; no source directory exists yet)

**Primary Dependencies**: Cloudflare Workers runtime, Wrangler, and the configured D1 database binding DB. Exact package versions are not yet established in a package manifest.

**Storage**: Cloudflare D1 (SQLite-compatible relational database); Wrangler database name bookstore-db-3

**Testing**: Vitest via npx vitest run; local D1 schema and SQL checks via npx wrangler d1 execute bookstore-db-3 --local, following the bookstore SDD workflow.

**Target Platform**: Cloudflare Workers, with local Wrangler development and local D1 validation

**Project Type**: HTTP API / Worker web service

**Performance Goals**: No response-time or throughput target is specified. Search result count is capped at 10; the catalog list is intentionally unbounded for Lab 1.

**Constraints**: All request-derived SQL values must be bound parameters. Database constraints enforce integrity. Search is ASCII case-insensitive substring matching. Do not trim or normalize whitespace; that decision is reserved for CHG-001 after testing. No real payment data or payment processing. Do not deploy or run remote migrations.

**Scale/Scope**: One Worker, one D1 database, six common relational tables created by migrations/0001_initial.sql. This feature's API scope is the three catalog/search GET routes only.

## Constitution Check

- **Database integrity first — PASS**: The proposed initial schema uses primary keys, foreign keys, CHECK constraints, UNIQUE constraints, and nonnegative stock. Local SQL validation is planned.
- **Testable acceptance criteria — PASS**: The API plan maps directly to AC-SEARCH-01 through AC-SEARCH-05 and the list/detail scenarios in the approved spec.
- **3NF — PASS**: The six relations separate categories, books, customers, orders, order lines, and order events. See data-model.md.
- **Parameterized SQL only — PASS**: Every query value from the URL will be passed as a bound parameter. No request value is interpolated into SQL text.
- **Atomic, idempotent purchases — PASS WITH SCOPE BOUNDARY**: The schema provides a unique orders.request_key and nonnegative stock. No purchase route or purchase implementation is in this feature; any future purchase feature must define and test atomic stock reservation and idempotent retry behavior before implementation.
- **Real test evidence — PASS**: Planned tests must be run against the actual Worker/D1 implementation; this plan does not claim tests have run.
- **Living specifications — PASS**: The approved search-route clarification is recorded as CHG-002 in spec.md. CHG-001 remains reserved for post-test whitespace clarification.
- **No real payment information — PASS**: The model has no payment credentials or card fields; fixtures must remain synthetic.

No constitution gate violations are proposed.

## Project Structure

### Documentation (this feature)

    specs/001-catalog-search/
    ├── plan.md
    ├── research.md
    ├── data-model.md
    ├── quickstart.md
    ├── contracts/
    │   └── books-api.md
    ├── checklists/
    │   └── requirements.md
    └── tasks.md                 # Not created; reserved for the separate tasks phase

### Source Code (proposed; not created)

    src/
    ├── index.ts                 # Worker entry and request routing; route search before dynamic book ID
    └── books.ts                 # Catalog queries using prepared D1 statements
    migrations/
    └── 0001_initial.sql         # All six common tables; not created in this planning phase
    tests/
    ├── unit/
    └── integration/

**Structure Decision**: Keep the existing single Worker entry point configured in wrangler.jsonc. Add only a small books module if it improves testability; avoid introducing repository/service layers absent a demonstrated need. Keep the initial D1 migration at the handout-required path and integration tests separate from pure routing/query helper tests.

## Complexity Tracking

No constitution violations or additional architectural projects are proposed. The customer/order tables are included in the required initial schema, but their API behaviors remain outside this feature.

## Proposed Implementation Sequence

1. Confirm the plan and API contract. Preserve the approved CHG-002 search route and CHG-001 whitespace deferral.
2. Create migrations/0001_initial.sql with all six tables in foreign-key dependency order: categories, books, customers, orders, order_items, order_events.
3. Validate the complete schema against local D1: PKs, FKs, CHECKs, UNIQUE constraints, stock >= 0, request_key uniqueness, and integer monetary columns.
4. Implement only GET /api/books, GET /api/books/search, and GET /api/books/:id. Register/match the static /api/books/search path before /api/books/:id.
5. Use prepared statements for every request-supplied SQL value. Keep list and search order deterministic by book ID.
6. Add and run real tests for list-all/no-limit, known and unknown IDs, ASCII case-insensitive substring matches, no matches, 10-result cap, empty query HTTP 400, route precedence, and database constraints.
7. Compare actual results with every approved acceptance criterion. Do not deploy, implement checkout, or proceed to the tasks phase as part of this plan approval.

## Follow-up before implementation

- Confirm behavior for a search request with q omitted; the approved spec currently covers only an empty query value.
- Define the exact JSON fields for a book response and the keys/message for the required JSON 404 error before writing tests that assert those shapes.
- Confirm the single currency convention represented by the *_cents columns before displaying prices.
