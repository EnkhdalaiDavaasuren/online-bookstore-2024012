# Online Bookstore lab progress

Updated November 27, 2026. Each bar counts the deliverables listed in the corresponding handout.

| Handout | Progress | Complete |
| --- | --- | --- |
| Lab 0 deliverables | `█████████░` | 13/14 (93%) |
| Lab 1 submission checklist | `█████████░` | 32/33 (97%) |

## Lab 0

| Deliverable | Status and evidence |
| --- | --- |
| GitHub repository and history | Complete. Local Git records `origin` and `origin/main`. |
| Original starter baseline | Awaiting instructor decision. The Lab 1 plan documents the student-authorized minimal Worker starter. Source `specs/001-catalog-search/plan.md`. |
| Tool versions | Complete. Node 26.13.1, npm 11.20.0, Spec Kit 1.4.2, uv 0.11.29, OpenClaw 2026.11.3, Wrangler 4.165.0. Lab 0 calls for Node 22 or instructor approval for another version. |
| Typecheck | Complete. `npm run typecheck` passed. Source `package.json`. |
| React build | Pending. The project needs React sources and a build script. Source `package.json`. |
| Unit and UI tests | Pending. No UI tests are present. The fresh Vitest run stopped in D1 migration setup before any test cases ran. Sources `vitest.config.ts`, `tests/apply-migrations.ts`. |
| Browser screenshot | Pending until the React shell runs. |
| D1 SQL evidence | Complete. Wrangler executed `SELECT 1 AS ok` locally and returned 1. Source `wrangler.jsonc`. |
| Spec Kit setup | Complete. CLI version verified and initialization artifacts tracked under `.specify/`. |
| OpenClaw project selection | Complete. The student shared a Telegram reply confirming the existing `main` agent selected the correct absolute repository path for that conversation, reported Git branch `main`, read `AGENTS.md`, and found `skills/bookstore-sdd/SKILL.md`. |
| Project wiki | Complete. Sources `docs/llm-wiki/WIKI-RULES.md` and the four baseline pages under `docs/llm-wiki/wiki/`. |
| Individual proposal | Complete. Sources `docs/llm-wiki/raw/proposal.md`, `specs/004-university-textbook-store/spec.md`. |
| Lab 0 commit | Complete. Local Git history contains `6578d84` (Complete Lab 0 setup). |

## Lab 1

| Checklist section | Complete | Evidence and remaining work |
| --- | --- | --- |
| Specification and database design | 6/6 | Constitution, catalog spec, plan, six-table model and ERD, tasks, and University Textbook Store spec and ERD. Sources `.specify/memory/constitution.md`, `specs/001-catalog-search/`, `specs/004-university-textbook-store/spec.md`. |
| Database implementation | 5/6 | Migration, synthetic seed, JOIN, GROUP BY, and query-plan evidence. Repeat constraint rejection tests after resolving test setup. Sources `migrations/0001_initial.sql`, `sql/seed.sql`, `tests/integration/database.test.ts`. |
| Worker backend | 5/5 | Category, catalog, detail, parameterized search, and JSON error responses verified through the local Worker. Sources `src/index.ts`, `src/books.ts`, `specs/001-catalog-search/contracts/books-api.md`. |
| React frontend | 0/5 | Catalog cards, keyword search, detail, loading/empty/error states, and browser Network evidence need an approved frontend scope and implementation. Source `specs/001-catalog-search/spec.md` describes the current API scope. |
| Testing and SDD | 2/6 | Search acceptance coverage exists and local HTTP smoke checks passed. CHG-001 is approved and recorded. Remaining items are a passing current automated run with UI coverage, UI acceptance checks, a complete traceability matrix, and GitHub feature branch evidence. Sources `tests/integration/search.test.ts`, `docs/changes.md`, `specs/001-catalog-search/quickstart.md`. |
| Project wiki | 5/5 | Prompt log, index and log, design decisions, test results, and linked sources and evidence are present. Sources `docs/ai-prompt-log.md`, `docs/llm-wiki/wiki/`, `docs/llm-wiki/raw/`. |

### Local verification

- Wrangler ran SQL against local `bookstore-db-3`. All six application tables were present, with 14 seeded books. A books/categories JOIN returned the expected category for book IDs 1–3. GROUP BY returned Databases 12, Computing 1, and Literature 1. `PRAGMA foreign_key_check` returned zero rows. Sources `wrangler.jsonc`, `migrations/0001_initial.sql`, `sql/seed.sql`.
- `EXPLAIN QUERY PLAN` reported `SEARCH books USING COVERING INDEX idx_books_category_id` for category equality and `SCAN books` for a leading-wildcard title search. Sources `migrations/0001_initial.sql`, `src/books.ts`.
- The local Worker returned 14 catalog records and HTTP 200 for categories. Detail returned the expected book and HTTP 404 for an unknown ID. Search returned IDs 1–10 in order for `database`, `DATABASE`, and a space-padded query. A nonmatching query returned an empty array. Missing, empty, and whitespace-only queries returned HTTP 400. `/api/health` returned HTTP 404. Sources `src/index.ts`, `src/books.ts`.
- `npm test` reached Vitest after a sandbox retry, then all five suites stopped in Miniflare D1 migration setup. Zero cases ran. The historical passing result remains in `specs/001-catalog-search/quickstart.md`. Sources `vitest.config.ts`, `tests/apply-migrations.ts`.

## Outside this repository

1. Keep the Telegram confirmation for Lab 0. To complete the separate multi-project exercise, register the bookstore under its project ID in the global OpenClaw registry and verify switching between registered projects.
2. Open the project wiki in Obsidian and confirm that its links render.
3. Confirm with the instructor whether the minimal starter and Node 26 are accepted for Lab 0 or whether you need the official starter and Node 22.
4. Once the repository gaps are closed, review and push the feature branch, open the Lab 1 pull request, and prepare the browser and SQL demonstration for the December 1 review.
