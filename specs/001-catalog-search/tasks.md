# Tasks: Book Catalog and Book Search

**Input**: Approved feature specification and design documents in specs/001-catalog-search/

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Automated Vitest and local D1 constraint/API tests are explicitly required. Write tests before their implementation tasks and verify expected failures before implementing.

**Organization**: Tasks are grouped by user story. All database and API verification uses local D1 database bookstore-db-3. No remote D1 or deployment is permitted.

## Format

- [P] identifies tasks in different files that can proceed in parallel after their prerequisites.
- [US1] through [US4] map to the approved user stories in spec.md.
- Every task includes its target file path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the approved minimal Cloudflare Worker, TypeScript, and Vitest project. The instructor starter is unavailable; follow the student-authorized minimal setup in plan.md.

- [X] T001 Create package.json, tsconfig.json, src/index.ts, and vitest.config.ts for the minimal Cloudflare Worker + TypeScript + Vitest setup; preserve the configured Wrangler D1 binding and database name bookstore-db-3.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Test and establish the complete six-table schema and synthetic local fixtures before user-story work.

- [X] T002 Add Vitest database-integrity tests in tests/integration/database.test.ts proving invalid foreign keys are rejected; categories.name, books.isbn, customers.email, and orders.request_key reject duplicates; order_items rejects duplicate (order_id, book_id); books.stock rejects negatives; monetary columns reject non-integer or negative values; quantity rejects non-integer or nonpositive values; and order status/event type CHECK values are enforced.
- [X] T003 Create migrations/0001_initial.sql with categories, books, customers, orders, order_items, and order_events plus all approved PK/FK/UNIQUE/CHECK rules. Canonical field references: data-model.md — categories.category_id, categories.name, categories.description; books.book_id, books.category_id, books.title, books.author, books.isbn, books.price_cents, books.stock; customers.customer_id, customers.full_name, customers.email, customers.created_at; orders.order_id, orders.customer_id, orders.request_key, orders.status, orders.created_at; order_items.order_id, order_items.book_id, order_items.quantity, order_items.unit_price_cents; order_events.order_event_id, order_events.order_id, order_events.event_type, order_events.occurred_at.
- [X] T004 Add synthetic catalog category and book fixtures in sql/seed.sql using USD integer cents; do not add real payment information or credentials.

**Checkpoint**: All six tables and synthetic catalog fixtures are available in the planned local schema; all invalid database writes are covered by tests.

---

## Phase 3: User Story 1 — Search books (Priority: P1, MVP)

**Goal**: Search book titles/authors with approved ASCII case-insensitive substring behavior.

**Independent Test**: AC-SEARCH-01 through AC-SEARCH-05 pass, including missing and empty q responses, ordering, and the 10-result cap.

### Tests

- [X] T005 [P] [US1] Add Vitest API tests in tests/integration/search.test.ts for AC-SEARCH-01 through AC-SEARCH-05, missing q and empty q= JSON errors, book response fields, deterministic ordering, 10-result cap, and route precedence.

### Implementation

- [X] T006 [US1] Implement parameterized D1 title/author substring search and GET /api/books/search in src/books.ts and src/index.ts; match the static route before GET /api/books/:id and do not trim or normalize the query. Use fields defined in data-model.md: books.book_id, books.title, books.author, books.category_id, books.isbn, books.price_cents, books.stock.

**Checkpoint**: Search independently satisfies AC-SEARCH-01 through AC-SEARCH-05 and returns the approved book record fields.

---

## Phase 4: User Story 2 — Browse all books (Priority: P2)

**Goal**: Return every catalog book once in ascending book ID order, without pagination or a result limit.

**Independent Test**: GET /api/books returns all seeded records in order, an empty list for an empty catalog, and the approved fields for each book.

### Tests

- [X] T007 [P] [US2] Add Vitest list tests in tests/integration/books-list.test.ts for complete unpaginated results, ascending book_id order, empty catalog, and all approved book JSON fields.

### Implementation

- [X] T008 [US2] Implement parameterized D1 listing and GET /api/books in src/books.ts and src/index.ts; return every row ordered by book ID with the approved representation. Use data-model.md fields: books.book_id, books.category_id, books.title, books.author, books.isbn, books.price_cents, books.stock.

**Checkpoint**: The list endpoint passes its independent tests without changing search behavior.

---

## Phase 5: User Story 3 — View one book (Priority: P2)

**Goal**: Return a known book by ID and the exact approved error response for an unknown ID.

**Independent Test**: A known ID returns one book with the approved fields; an unknown ID returns HTTP 404 and exactly {"error":"Book not found"}.

### Tests

- [X] T009 [P] [US3] Add Vitest detail tests in tests/integration/book-details.test.ts for known IDs, all approved book JSON fields, and the exact HTTP 404 JSON body.

### Implementation

- [X] T010 [US3] Implement the parameterized D1 lookup and GET /api/books/:id in src/books.ts and src/index.ts; return the approved book fields and exact not-found body. Use data-model.md fields: books.book_id, books.category_id, books.title, books.author, books.isbn, books.price_cents, books.stock.

**Checkpoint**: Detail lookup passes known/unknown ID tests and does not capture the static search route.

---

## Phase 6: User Story 4 — Browse categories (Priority: P2)

**Goal**: Return all categories deterministically through GET /api/categories.

**Independent Test**: Categories are returned once in ascending category_id order with category_id, name, and description; an empty table returns [].

### Tests

- [X] T011 [P] [US4] Add Vitest category-list tests in tests/integration/categories.test.ts for ascending order, all approved fields, no pagination/result cap, and empty-list behavior.

### Implementation

- [X] T012 [US4] Implement the parameterized D1 category listing in src/books.ts and register GET /api/categories in src/index.ts using data-model.md fields categories.category_id, categories.name, categories.description.

**Checkpoint**: Category listing passes its independent tests and does not alter book routes.

---

## Phase 7: Polish and Local Verification

**Purpose**: Run the actual migration, test suite, and HTTP API verification against the configured local D1 database.

- [X] T013 Apply migrations/0001_initial.sql and sql/seed.sql to local D1 database bookstore-db-3 using Wrangler with --local; run PRAGMA foreign_key_check and the database constraint tests; record actual output in specs/001-catalog-search/quickstart.md. Do not use remote D1.
- [X] T014 Run npx vitest run and confirm every approved spec acceptance criterion and database constraint test passes; record the real command and results in specs/001-catalog-search/quickstart.md.
- [X] T015 Start the Worker locally against configured D1 database bookstore-db-3 and verify GET /api/books, GET /api/books/:id, GET /api/books/search, and GET /api/categories, including static search-route precedence and exact response behavior; record actual results in specs/001-catalog-search/quickstart.md. Do not deploy.

---

## Dependencies and Execution Order

- Setup T001 precedes the test/runtime and schema work.
- Foundational tasks proceed T002 → T003 → T004. T002 defines failing database-integrity tests before the migration is implemented.
- User-story tests T005, T007, T009, and T011 can be authored in parallel after the setup and approved spec/model are available because they use separate test files. Each story's implementation follows its tests.
- All user stories depend on the foundational schema and fixtures. Story implementations share src/index.ts and should be integrated sequentially; the search route must remain before the dynamic book-ID route.
- Local verification T013–T015 follows implementation and depends on the approved migration, seed, Worker, and tests.

## Parallel Opportunities

- After T001, the separate API test files T005, T007, T009, and T011 can be authored in parallel.
- Story implementations are not marked parallel because they update the shared Worker router and may share src/books.ts.

## Parallel Example

After T001 and schema/API design are settled, work may proceed on these separate test files in parallel:

    tests/integration/search.test.ts (T005)
    tests/integration/books-list.test.ts (T007)
    tests/integration/book-details.test.ts (T009)
    tests/integration/categories.test.ts (T011)

## Implementation Strategy

### MVP First

1. Complete setup and the six-table database foundation.
2. Implement and independently verify US1 Search books (P1).
3. Continue with US2 list, US3 detail, and US4 categories after the shared foundation.
4. Run the required local D1 migration, full Vitest suite, and local Worker/API verification before review.

### Approval Boundary

This file plans implementation only. It does not authorize or perform implementation. Obtain separate implementation approval before creating project setup files, source/test code, the SQL migration, or seed data. All database execution remains local to bookstore-db-3; never deploy as part of this feature.
# Lab 0 and Lab 1 browser follow-up

CHG-008 follows the original backend tasks. The student approved T016–T021 on November 27, 2026.

- [X] T016 Configure React, TypeScript, esbuild, and Wrangler static assets in `package.json`, `package-lock.json`, `tsconfig.json`, `wrangler.jsonc`, and `.gitignore`. Add build and Worker type generation commands. Track source files and ignore `public/assets/app.js`.
- [X] T017 Add the D1 health endpoint in `src/index.ts` and cover successful and failed health checks in `tests/integration/` (AC-HEALTH-01).
- [X] T018 Implement the React shell, catalog, search form, and detail view in `client/` with `public/index.html` and `public/styles.css`. Use the existing same-origin Worker API (AC-HEALTH-01, AC-UI-01 through AC-UI-03).
- [X] T019 Fix the local Vitest D1 setup failure and run the Worker suites and React UI tests. Cover catalog loading, search submission and empty results, detail, and request failures (AC-UI-01 through AC-UI-03).
- [X] T020 Run type generation, typecheck, build, tests, and local D1 and HTTP checks. Verify the catalog, search and detail in a browser and capture the Lab 0 screenshot and Lab 1 Network evidence.
- [X] T021 Record the evidence and acceptance-criteria traceability. Run the Lab 1 convergence review and update the wiki progress tracker.
