# Research: Book Catalog and Book Search

## Decision: Use the existing Worker-to-D1 binding

**Decision**: Build one Cloudflare Worker using the configured D1 binding named DB. Keep the Worker entry at src/index.ts, matching wrangler.jsonc; add the source directory only during implementation.

**Rationale**: The repository configuration already identifies a Worker entry point and the D1 binding. Cloudflare documents accessing D1 through the Worker environment binding.

**Alternatives considered**: A separate API service or service-binding architecture. Rejected for Lab 1 because there is no existing service to split and the project has one configured Worker/database.

## Decision: Parameterized SQL and prepared statements

**Decision**: Prepare SQL with placeholders and bind all values derived from request paths or query parameters.

**Rationale**: This is required by Constitution Principle IV and supported by D1 prepared statements. Static SQL structure remains fixed; user text is supplied only as a bound value.

**Alternatives considered**: SQL string concatenation or D1 exec with interpolated values. Rejected because variable data must not be interpolated into SQL.

## Decision: ASCII case-insensitive substring search

**Decision**: Implement title-or-author substring search with SQLite LIKE behavior, ordered by book_id and limited to 10 results. Escape SQL LIKE wildcard characters in the bound search pattern so the search term is interpreted as a literal substring. Do not trim or normalize leading/trailing whitespace.

**Rationale**: The student explicitly approved ASCII case-insensitive matching and excluded Unicode case-folding for this initial implementation. SQLite documents that default LIKE matching ignores ASCII case but does not case-fold non-ASCII characters. Percent and underscore are LIKE wildcards, so escaping them preserves literal-substring semantics.

**Alternatives considered**: Unicode case-folding/ICU or full-text search. Deferred because Unicode matching is explicitly out of scope and no scale or relevance-ranking requirement is specified.

## Decision: D1 batch for future multi-statement atomic work; no purchase behavior in this feature

**Decision**: Keep purchase mutations out of Catalog/Search implementation. Any future purchase feature must design a transaction-safe stock-check path where insufficient stock aborts all related order, item, event, and stock writes. Reusing request_key must return or identify the existing logical order rather than creating a duplicate.

**Rationale**: D1 batch executes prepared statements sequentially in a transaction and rolls back the sequence when a statement fails. A zero-row conditional update alone is not a SQL statement failure, so future checkout code must not assume that checking affected-row counts after a committed batch provides rollback. The purchase mechanism needs a separately approved feature design and real concurrency tests.

**Alternatives considered**: Performing independent order and stock writes. Rejected because partial updates can violate atomicity and overselling requirements.

## Decision: One category and one author value per book for Lab 1

**Decision**: Use books.category_id and one scalar books.author text value, as approved. Do not add category or author junction tables.

**Rationale**: The student explicitly approved these cardinalities for Lab 1. The proposed fields are atomic values; descriptive category data is held once in categories.

**Alternatives considered**: Many-to-many book/category or book/author relations. Deferred as outside the approved Lab 1 model.

## Sources consulted

- Cloudflare D1 documentation, “D1 Database” (Worker env binding, prepared statements, batch transaction behavior; documentation current during planning on 2026-11-19).
- Cloudflare D1 documentation, “Define foreign keys” (foreign-key enforcement defaults; documentation last updated 2026-11-10).
- Cloudflare D1 documentation, “Wrangler commands” (local D1 execution syntax; consulted 2026-11-19).
- SQLite documentation, “SQL Language Expressions” (LIKE wildcard and ASCII case behavior; consulted 2026-11-19).
- Repository configuration: wrangler.jsonc; project constitution and approved feature spec.
