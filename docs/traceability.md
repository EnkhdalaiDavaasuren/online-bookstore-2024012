# Lab 1 requirements traceability

| Requirement | Implementation | Verification |
| --- | --- | --- |
| AC-SEARCH-01 Title and author substring matches, ordered by ID | `src/books.ts` | `tests/integration/search.test.ts`. Local D1 and Chrome returned IDs 1–10 in the same order. |
| AC-SEARCH-02 ASCII case-insensitive matching | `src/books.ts` | `tests/integration/search.test.ts`. Earlier local HTTP checks compared `database` and `DATABASE`. |
| AC-SEARCH-03 Empty result | `src/books.ts`, `client/App.tsx` | `tests/integration/search.test.ts`, `tests/ui/App.test.tsx`. Chrome displayed the empty state for an unknown term. |
| AC-SEARCH-04 Maximum of ten results | `src/books.ts` | `tests/integration/search.test.ts`. Local D1 and Chrome returned ten results for the 12 seeded database titles. |
| AC-SEARCH-05 Missing or empty input returns 400 | `src/index.ts` | `tests/integration/search.test.ts`. Earlier local HTTP checks returned 400 for both forms. |
| AC-SEARCH-06 Trim boundary whitespace | `src/index.ts` | `tests/integration/search.test.ts`. Chrome sent the padded query and displayed IDs 1–10. Earlier HTTP checks confirmed equality with the plain query and rejection of whitespace-only input. |
| AC-BOOK-01/02 Ordered catalog, record fields and detail 404 | `src/books.ts`, `src/index.ts` | `tests/integration/books-list.test.ts`, `tests/integration/book-details.test.ts`. Local HTTP served 14 seeded books and the specified 404 for an unknown ID. |
| AC-CATEGORY-01/02 Ordered category records and empty list | `src/books.ts`, `src/index.ts` | `tests/integration/categories.test.ts`. Local HTTP category route returned 200. |
| AC-HEALTH-01 D1 health check | `src/index.ts`, `client/App.tsx` | `tests/integration/health.test.ts`, `tests/ui/App.test.tsx`. Chrome received HTTP 200 and displayed “Database connected.” Local SQL returned `ok = 1`. |
| AC-UI-01 Initial catalog and book cards | `client/App.tsx`, `public/index.html` | `tests/ui/App.test.tsx`. Chrome displayed 14 cards from the local API. |
| AC-UI-02 Server-side search and empty state | `client/App.tsx` | `tests/ui/App.test.tsx`. Chrome compared the search response titles with the rendered cards, checked the empty state, and restored the full catalog. |
| AC-UI-03 Detail and request states | `client/App.tsx` | `tests/ui/App.test.tsx`. Chrome fetched book 1 and restored the prior search results after closing detail. The UI suite covers loading and request failure. |
| Six-table relational model, key and value constraints | `migrations/0001_initial.sql` | `tests/integration/database.test.ts`. Local D1 `PRAGMA foreign_key_check` returned zero rows. |

Browser evidence is available in [Lab 0 screenshot](llm-wiki/wiki/evidence/lab0-browser.png), [Lab 1 screenshot](llm-wiki/wiki/evidence/lab1-search.png), and [captured API requests](llm-wiki/wiki/evidence/lab1-browser-network.json).
