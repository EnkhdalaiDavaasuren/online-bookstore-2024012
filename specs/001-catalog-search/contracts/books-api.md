# Catalog and Search API Contract

This contract is derived from the approved feature specification and CHG-002. JSON error object keys/message text are not fixed by the approved spec and remain a response-design detail for a later approved change if needed.

## GET /api/books

- Purpose: list every catalog book.
- Ordering: ascending book_id.
- Pagination/result limit: none for the initial Lab 1 implementation.
- Empty catalog: JSON empty list.

## GET /api/books/search?q={query}

- Purpose: search book title or author using ASCII case-insensitive substring matching.
- Query parameter: q.
- Empty query value: HTTP 400.
- No matches: JSON empty list ([]).
- Ordering: ascending book_id.
- Maximum: 10 results; if more match, return the first 10 in that ordering.
- Whitespace: no trimming or normalization is specified. CHG-001 remains deferred until after testing.
- Routing: match this static route before the dynamic /api/books/:id route.

## GET /api/books/:id

- Purpose: return the requested book.
- Existing ID: return the book representation.
- Unknown ID: HTTP 404 with a JSON error response.

## Common constraints

- Request values in SQL statements must be bound as parameters.
- List and search results are deterministic by book_id ascending.
- This feature does not expose customer, order, checkout, or payment endpoints.
- The book response’s exact JSON field naming is not fixed beyond the catalog attributes and remains aligned with the approved implementation contract.

## Follow-up before implementation

- The approved spec defines an empty q value as HTTP 400 but does not explicitly define the behavior when q is omitted entirely. Do not silently treat these cases as equivalent without approval.
- The exact book JSON field names and the keys/message in the HTTP 404 JSON error object are not specified. Set these in an approved contract/spec update before implementation if tests require exact shapes.
- price_cents uses a single implicit project currency; the currency label/display convention is not specified in the feature spec. Confirm it before exposing monetary values to customers.
