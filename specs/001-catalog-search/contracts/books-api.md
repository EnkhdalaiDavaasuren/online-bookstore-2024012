# Catalog and Search API Contract

This contract reflects the approved requirements in spec.md and CHG-001 through CHG-007.

## Book record

Every book JSON record returned by GET /api/books, GET /api/books/search, or GET /api/books/:id includes these fields: book_id, category_id, title, author, isbn, price_cents, and stock. The isbn key remains present with a null value when there is no ISBN. Catalog prices use USD integer cents.

## GET /api/books

- Purpose: list every catalog book.
- Ordering: ascending book_id.
- Pagination/result limit: none for the initial Lab 1 implementation.
- Empty catalog: JSON empty list ([]).
- Each record follows the Book record contract above.

## GET /api/books/search?q={query}

- Purpose: search book title or author using ASCII case-insensitive substring matching.
- Query parameter: q. Trim leading and trailing whitespace before matching; do not otherwise normalize the query.
- Missing q, empty q=, or a value that becomes empty after trimming: HTTP 400 with a JSON error response. The spec does not prescribe the exact JSON error keys/message.
- No matches: JSON empty list ([]).
- Ordering: ascending book_id.
- Maximum: 10 records; when more match, return the first 10 in that ordering.
- Unicode case-folding is out of scope for the initial implementation.
- AC-SEARCH-06: q=%20%20database%20%20 returns exactly the same ordered books as q=database.
- Routing: handle this static route before the dynamic GET /api/books/:id route.

## GET /api/books/:id

- Purpose: return the requested book record using the approved Book record fields.
- Unknown ID: HTTP 404 with exactly the JSON body {"error":"Book not found"}.

## GET /api/categories

- Purpose: list all categories.
- Ordering: ascending category_id.
- Pagination/result limit: none.
- Empty category table: JSON empty list ([]).
- Each category record includes category_id, name, and description.

## Common constraints

- Request values used in D1 statements must be bound as parameters; do not concatenate request values into SQL.
- List and search results are deterministic by ascending book_id; category results are ordered by ascending category_id.
- All initial catalog monetary values use USD integer cents.
- This feature does not expose customer, order, checkout, or payment endpoints.
