# Online Bookstore Change Log

This log records approved specification changes and their rationale and impact. CHG-001 remains reserved; it is not an approved behavior change in this phase.

## CHG-001 — Reserved for post-test whitespace clarification

- **Status**: Reserved; no behavior approved or added.
- **Scope**: After the initial implementation and testing, propose the whitespace rule discovered by that exercise.
- **Impact**: None in the current specification or task list. No trimming or normalization is introduced now.

## CHG-002 — Search endpoint path

- **Status**: Approved 2026-11-19.
- **Decision**: Expose book search through GET /api/books/search with query parameter q.
- **Rationale**: Keep search distinct from the unfiltered GET /api/books list and the dynamic book-by-ID route.
- **Impact**: Updates the feature specification and API contract; implementation must match the static search route before GET /api/books/:id.

## CHG-003 — ASCII case-insensitive matching

- **Status**: Approved 2026-11-19.
- **Decision**: Initial title/author substring matching is ASCII case-insensitive; Unicode case-folding is out of scope.
- **Rationale**: Bound initial Lab 1 behavior to the approved examples and implementation scope.
- **Impact**: Updates FR-006 and the search contract; tests cover ASCII case differences, not Unicode case-folding.

## CHG-004 — Missing and empty search query

- **Status**: Approved 2026-11-19.
- **Decision**: Both an omitted q parameter and an empty q= value return HTTP 400 with a JSON error response.
- **Rationale**: Reject absent and empty search terms consistently.
- **Impact**: Updates AC-SEARCH-05, FR-009, edge cases, API validation, and automated search tests. No exact JSON body is mandated for this search error.

## CHG-005 — Book response fields and not-found body

- **Status**: Approved 2026-11-19.
- **Decision**: Every book JSON record from list, search, or detail includes book_id, category_id, title, author, isbn, price_cents, and stock; isbn remains present as null when absent. An unknown book ID returns HTTP 404 with exactly {"error":"Book not found"}.
- **Rationale**: Provide a stable, explicit catalog response contract.
- **Impact**: Updates book acceptance criteria and FR-004/FR-011; constrains serializers and tests for all three book endpoints.

## CHG-006 — USD integer-cents convention

- **Status**: Approved 2026-11-19.
- **Decision**: USD is the initial catalog currency, and monetary values are stored as integer cents.
- **Rationale**: Establish one initial currency and avoid floating-point monetary storage.
- **Impact**: Updates FR-012 and the feature assumptions; constrains catalog price representation, order-item price storage, seed fixtures, and related tests. No real payment processing or payment information is introduced.

## CHG-007 — Category listing API

- **Status**: Approved 2026-11-19.
- **Decision**: Add GET /api/categories. It returns all category records in ascending category_id order, without pagination or a result limit; records include category_id, name, and description; an empty category table returns [].
- **Rationale**: Satisfy the Lab 1 category-list requirement with deterministic, testable behavior.
- **Impact**: Adds a category-list user story, acceptance criteria, API route/contract, implementation task, and Vitest coverage.
