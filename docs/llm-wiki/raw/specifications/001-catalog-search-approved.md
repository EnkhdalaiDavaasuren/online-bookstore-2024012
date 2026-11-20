# Feature Specification: Book Catalog and Book Search

**Feature Branch**: Not created (specification only)

**Created**: 2026-11-19

**Status**: Approved specification

**Input**: User description: Customers can list books, view one book by ID, search by title or author, and list categories. Search is ASCII case-insensitive substring matching through GET /api/books/search?q=..., ordered by ascending book ID and limited to 10. A missing q or empty q= returns HTTP 400 with a JSON error; no matches return []. GET /api/books returns every book ordered by ascending ID. GET /api/books/:id returns a book or HTTP 404 with {"error":"Book not found"}. Book JSON records include book_id, category_id, title, author, isbn, price_cents, and stock. GET /api/categories returns all categories. Initial catalog prices use USD stored as integer cents. Unicode case-folding is out of scope. Per approved CHG-001, leading and trailing whitespace is trimmed from q before matching; a query that becomes empty after trimming returns HTTP 400 with the existing JSON error response.

## Clarifications

### Session 2026-11-19

- CHG-002: Q: Which route should expose book search? → A: GET /api/books/search?q=.... Rationale: keep search distinct from the all-books list and the book-by-ID route. Approved by the student on 2026-11-19.
- CHG-003: Q: What case-insensitive behavior is required for the initial implementation? → A: ASCII case-insensitive matching; Unicode case-folding is out of scope. Rationale: bound the initial matching behavior to the approved Lab 1 requirement. Approved by the student on 2026-11-19.
- CHG-004: A missing q parameter or empty q= MUST return HTTP 400 with a JSON error response. Rationale: reject absent and empty search terms consistently. Impact: search validation, API contract, and acceptance tests. Approved by the student on 2026-11-19.
- CHG-005: Book JSON records from list, search, and detail MUST include book_id, category_id, title, author, isbn, price_cents, and stock; isbn remains present as null when absent. An unknown book ID MUST return HTTP 404 with exactly {"error":"Book not found"}. Rationale: make catalog responses stable and testable. Impact: serialization and API tests. Approved by the student on 2026-11-19.
- CHG-006: Initial catalog currency is USD; monetary values MUST be stored as integer cents. Rationale: use a single currency and avoid floating-point monetary storage. Impact: schema interpretation, seed fixtures, and price serialization. Approved by the student on 2026-11-19.
- CHG-007: Add GET /api/categories. It MUST return all categories ordered by ascending category_id with category_id, name, and description; it has no pagination/result limit and returns [] when no categories exist. Rationale: satisfy the Lab 1 category-list requirement with deterministic behavior. Impact: adds a category-list story, route, response contract, and tests. Approved by the student on 2026-11-19.
- CHG-001: Trim leading and trailing whitespace from q before search matching. If trimming produces an empty query, return HTTP 400 with the existing JSON error response. Preserve ASCII case-insensitive substring matching, ascending book ID ordering, and the 10-result maximum. Rationale: ensure incidental boundary whitespace does not change a search. Impact: search validation/normalization, API contract, and regression tests. Approved by the student on 2026-11-20.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search books (Priority: P1)

As a customer, I want to search for books by title or author so that I can find books relevant to my interests.

**Why this priority**: Search is a primary way for customers to find relevant catalog entries.

**Independent Test**: Search a catalog containing titles and authors with known substring matches; verify the matching books, ordering, result cap, and empty-query behavior.

**Acceptance Scenarios**:

1. **AC-SEARCH-01**: **Given** a catalog with books whose titles or authors contain the substring "database", **When** the customer searches GET /api/books/search?q=database, **Then** matching books are returned in ascending book ID order, up to the first 10 matches.
2. **AC-SEARCH-02**: **Given** the same catalog, **When** the customer searches for "DATABASE", **Then** the same ordered results are returned as for "database".
3. **AC-SEARCH-03**: **Given** no book title or author contains "unknown-book-xyz", **When** the customer searches for that term, **Then** the response is an empty list ([]).
4. **AC-SEARCH-04**: **Given** more than 10 books match a query, **When** the customer searches, **Then** the response contains only the first 10 matching books ordered by ascending book ID.
5. **AC-SEARCH-05**: **Given** q is missing or has an empty value (q=), **When** the customer requests GET /api/books/search, **Then** the response status is HTTP 400 and the body is a JSON error response.
6. **AC-SEARCH-06**: **Given** the catalog contains matching books, **When** the customer searches with `q=%20%20database%20%20`, **Then** the response contains exactly the same books, in the same order, as `q=database`; if trimming q leaves it empty, the response is HTTP 400 with the existing JSON error response.

---

### User Story 2 - Browse all books (Priority: P2)

As a customer, I want to list the books in the catalog so that I can browse all available catalog entries.

**Why this priority**: Listing supports customers who want to browse without entering a search term.

**Independent Test**: Request the catalog list for a known catalog and compare the complete response with all catalog books in ascending book ID order.

**Acceptance Scenarios**:

1. **Given** books exist in the catalog, **When** the customer requests GET /api/books, **Then** every book is returned once, ordered by ascending book ID, with no pagination or result limit.
2. **Given** the catalog contains no books, **When** the customer requests GET /api/books, **Then** an empty list is returned.
3. **AC-BOOK-01**: **Given** a book is returned by GET /api/books, GET /api/books/search, or GET /api/books/:id, **Then** its JSON object includes book_id, category_id, title, author, isbn, price_cents, and stock; isbn is present as null when absent.

---

### User Story 3 - View one book (Priority: P2)

As a customer, I want to view one book by its ID so that I can inspect that catalog entry.

**Why this priority**: Customers need to open an individual book, including one found through search or browsing.

**Independent Test**: Request a known book ID and an unknown book ID; verify the matching book response and the specified not-found response.

**Acceptance Scenarios**:

1. **Given** a book exists with the requested ID, **When** the customer requests GET /api/books/:id, **Then** that book is returned.
2. **AC-BOOK-02**: **Given** no book exists with the requested ID, **When** the customer requests GET /api/books/:id, **Then** the response is HTTP 404 with exactly {"error":"Book not found"}.

---

### User Story 4 - Browse categories (Priority: P2)

As a customer, I want to list book categories so that I can browse the catalog by category.

**Why this priority**: Category listing is required by the Lab 1 handout and supports catalog browsing.

**Independent Test**: Request GET /api/categories using synthetic categories and verify fields, ordering, and the empty-list response.

**Acceptance Scenarios**:

1. **AC-CATEGORY-01**: **Given** categories exist, **When** the customer requests GET /api/categories, **Then** all categories are returned once in ascending category_id order, without pagination or a result limit, and each record contains category_id, name, and description.
2. **AC-CATEGORY-02**: **Given** no categories exist, **When** the customer requests GET /api/categories, **Then** an empty list is returned ([]).

### Edge Cases

- An empty catalog list returns an empty list.
- No search matches returns exactly an empty list ([]).
- More than 10 search matches are reduced to the first 10 in ascending book ID order; the list operation remains unlimited.
- A missing q parameter, empty q= value, or a query consisting only of whitespace returns HTTP 400 with a JSON error response after trimming.
- An unknown book ID returns HTTP 404 with a JSON error response.
- Per approved CHG-001, leading and trailing whitespace is trimmed from q before matching. No other query normalization is introduced.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow customers to list all books through GET /api/books.
- **FR-002**: The book-list response MUST contain all catalog books, without pagination or a result limit, ordered by ascending book ID.
- **FR-003**: The system MUST allow customers to view a book by ID through GET /api/books/:id.
- **FR-004**: When the requested book ID does not exist, the system MUST return HTTP 404 with exactly the JSON body {"error":"Book not found"}.
- **FR-005**: The system MUST allow customers to search book titles and authors using partial/substring matching.
- **FR-006**: Search matching MUST be ASCII case-insensitive for both title and author; Unicode case-folding is out of scope for the initial implementation.
- **FR-007**: Search results MUST be ordered by ascending book ID and MUST contain no more than 10 books; when more than 10 books match, only the first 10 in that order are returned.
- **FR-008**: A search with no matching books MUST return an empty list ([]).
- **FR-009**: A missing q parameter or an empty q= search query MUST return HTTP 400 with a JSON error response.
- **FR-010**: Customers MUST be able to search through GET /api/books/search using the q query parameter.
- **FR-011**: Each book JSON record returned by GET /api/books, GET /api/books/search, or GET /api/books/:id MUST include book_id, category_id, title, author, isbn, price_cents, and stock; isbn MUST be present with a null value when absent.
- **FR-012**: The initial catalog currency MUST be USD; monetary values MUST be stored as integer cents.
- **FR-013**: The system MUST allow customers to list categories through GET /api/categories; all categories MUST be returned once in ascending category_id order, without pagination or a result limit, with category_id, name, and description; an empty category list MUST return [].
- **FR-SEARCH-06**: The system MUST trim leading and trailing whitespace from q before matching. It MUST preserve ASCII case-insensitive title/author substring matching, ascending book ID ordering, and the 10-result maximum. If trimming produces an empty query, the system MUST return HTTP 400 with the existing JSON error response.

### Key Entities *(include if feature involves data)*

- **Book**: A catalog entry with a unique book ID, one category, one author text value, USD price in integer cents, stock, and an optional ISBN; book JSON records expose the approved fields.
- **Category**: A catalog classification listed through GET /api/categories with category_id, name, and description.
- **Search query**: Customer-provided text matched as an ASCII case-insensitive substring against book titles and authors.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All six search acceptance criteria, AC-SEARCH-01 through AC-SEARCH-06, pass against a catalog with controlled test records.
- **SC-002**: A list request returns 100% of catalog books exactly once, in ascending book ID order, regardless of catalog size.
- **SC-003**: A search response contains 0 to 10 books, ordered by ascending book ID; no-match searches return exactly an empty list ([]).
- **SC-004**: A known book ID returns that book with the approved JSON fields, while an unknown ID consistently returns HTTP 404 with {"error":"Book not found"}.
- **SC-005**: GET /api/categories returns every category once in ascending category_id order with the approved fields, or [] when no categories exist.
- **SC-006**: Initial catalog monetary values use USD and are represented as integer cents.

## Assumptions

- Catalog books have unique IDs, titles, and author values available for these customer operations.
- The approved customer-facing catalog paths are GET /api/books, GET /api/books/:id, GET /api/books/search, and GET /api/categories.
- The initial catalog currency is USD and monetary amounts are stored as integer cents.
- Per approved CHG-001, leading/trailing whitespace is trimmed from q; whitespace-only q is rejected as HTTP 400. No other query normalization is performed.
- Creating, updating, deleting, purchasing, or paying for books is outside this feature's scope.
