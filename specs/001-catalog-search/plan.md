# Implementation Plan: Book Catalog and Book Search

**Branch**: main | **Date**: 2026-11-19 | **Spec**: spec.md

**Input**: Approved feature specification at specs/001-catalog-search/spec.md

## Summary

Build the Lab 1 Cloudflare Worker catalog API backed by D1. The initial SQL migration is explicitly required to create all six common bookstore tables. Feature 001 implements GET /api/books, GET /api/books/:id, GET /api/books/search, and GET /api/categories; category listing returns all categories by ascending category_id without pagination, with category_id, name, and description, and [] when empty. Customer/order APIs and checkout are not implemented. Search uses ASCII case-insensitive substring matching, ascending book ID order, and a 10-result maximum. Missing q or empty q= returns HTTP 400 with a JSON error. Book records expose book_id, category_id, title, author, isbn, price_cents, and stock; unknown book IDs return exactly {"error":"Book not found"}. Initial catalog currency is USD, stored as integer cents. No whitespace trimming or normalization is introduced; CHG-001 remains reserved. The complete six-table model and ERD are in data-model.md.

## Technical Context

**Language/Version**: TypeScript (Wrangler configuration points to src/index.ts; no source directory exists yet)

**Primary Dependencies**: Cloudflare Workers runtime, Wrangler, and the configured D1 database binding DB. Exact package versions are not yet established in a package manifest.

**Storage**: Cloudflare D1 (SQLite-compatible relational database); Wrangler database name bookstore-db-3

**Testing**: Vitest via npx vitest run; local D1 schema and SQL checks via npx wrangler d1 execute bookstore-db-3 --local, following the bookstore SDD workflow.

**Target Platform**: Cloudflare Workers, with local Wrangler development and local D1 validation

**Project Type**: HTTP API / Worker web service

**Performance Goals**: No response-time or throughput target is specified. Search result count is capped at 10; the catalog list is intentionally unbounded for Lab 1.

**Constraints**: All request-derived SQL values must be bound parameters. Database constraints enforce integrity. Search is ASCII case-insensitive substring matching; missing or empty q produces HTTP 400 with a JSON error. Do not trim or normalize whitespace; CHG-001 remains deferred until after initial implementation and testing. Monetary values use USD integer cents. No real payment data or payment processing. Do not deploy or run remote migrations.

**Scale/Scope**: One Worker, one D1 database, six common relational tables created by migrations/0001_initial.sql. Feature 001 exposes four catalog/search GET routes: books list, book detail, book search, and category list.

## Constitution Check

- **Database integrity first — PASS**: The proposed initial schema uses primary keys, foreign keys, CHECK constraints, UNIQUE constraints, and nonnegative stock. Local SQL validation is planned.
- **Testable acceptance criteria — PASS**: The API plan maps to AC-SEARCH-01 through AC-SEARCH-05, AC-BOOK-01/02, AC-CATEGORY-01/02, and the approved list/detail scenarios.
- **3NF — PASS**: The six relations separate categories, books, customers, orders, order lines, and order events. See data-model.md.
- **Parameterized SQL only — PASS**: Every query value from the URL will be passed as a bound parameter. No request value is interpolated into SQL text.
- **Atomic, idempotent purchases — PASS WITH SCOPE BOUNDARY**: The schema provides a unique orders.request_key and nonnegative stock. No purchase route or purchase implementation is in this feature; any future purchase feature must define and test atomic stock reservation and idempotent retry behavior before implementation.
- **Real test evidence — PASS**: Planned tests must be run against the actual Worker/D1 implementation; this plan does not claim tests have run.
- **Living specifications — PASS**: CHG-002 through CHG-007 are approved and recorded in spec.md and docs/changes.md. CHG-001 remains reserved for the post-test whitespace exercise.
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
    └── tasks.md                 # Approved task list; implementation still requires separate approval

### Source Code (proposed; not created)

    package.json                # Worker and Vitest scripts/dependencies; planned only
    tsconfig.json                # TypeScript configuration; planned only
    vitest.config.ts             # Vitest/Worker test configuration; planned only
    src/
    ├── index.ts                 # Worker entry and routing; static search route before dynamic book ID
    └── books.ts                 # Parameterized book and category D1 queries
    migrations/
    └── 0001_initial.sql         # All six common tables; not created in this documentation task
    sql/
    └── seed.sql                 # Synthetic category/book fixtures; not created yet
    tests/
    ├── unit/
    └── integration/

**Structure Decision**: Keep the single Worker entry point configured in wrangler.jsonc and use a small books module for parameterized book and category queries; avoid introducing repository/service layers absent a demonstrated need. Keep the initial D1 migration at the handout-required path and integration tests separate from pure routing/query helper tests.

## Complexity Tracking

No constitution violations or additional architectural projects are proposed. All six tables are included in the required initial schema; the feature exposes catalog and category-list APIs only, with no customer/order or checkout APIs.

## Proposed Implementation Sequence

1. Confirm the plan and API contract. Preserve the approved CHG-002 search route and CHG-001 whitespace deferral.
2. Create migrations/0001_initial.sql with all six tables in foreign-key dependency order: categories, books, customers, orders, order_items, order_events.
3. Validate the complete schema against local D1: PKs, FKs, CHECKs, UNIQUE constraints, stock >= 0, request_key uniqueness, and integer monetary columns.
4. Implement GET /api/books, GET /api/books/:id, GET /api/books/search, and GET /api/categories. Register/match the static /api/books/search path before /api/books/:id.
5. Use prepared statements for every request-supplied SQL value. Keep book list, search, and category list ordering deterministic by ascending ID.
6. Add and run real tests for all approved search, book-response, book-detail, category-list, and database-constraint criteria, including missing/empty q, exact book 404 body, route precedence, and local D1 behavior.
7. Compare results with every approved acceptance criterion. Use only local D1 bookstore-db-3; do not deploy or implement checkout.

## Remaining contract detail

The spec requires a JSON error response for missing/empty q but does not prescribe its exact JSON keys or message. Tests should verify a valid JSON error response without assuming an unapproved literal body.
# Lab 0 and Lab 1 browser follow-up

CHG-008 addresses the remaining handout requirements for the React browser shell, health evidence, and catalog UI. Use React and TypeScript in `client/`, bundle with esbuild, and serve same-origin files through Wrangler assets. Read the existing API contract for catalog fields and response shapes. The health route uses a read-only D1 query. D1 remains authoritative for catalog, price, and stock.

Use the existing Node 26 environment and local D1. Add UI checks alongside the existing Worker integration suite. Compare SQL output, HTTP responses, and the browser's Network view. Document browser and test results and map them to the approved acceptance criteria. The University Textbook Store spec and ERD remain Lab 1 deliverables.
