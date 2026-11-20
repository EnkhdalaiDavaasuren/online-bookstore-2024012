---
title: Test results and lessons
type: concept
tags: [bookstore]
created: 2026-11-20
updated: 2026-11-20
sources:
  - docs/llm-wiki/raw/projects/catalog-search-verification.md
  - docs/llm-wiki/raw/specifications/001-catalog-search-approved.md
  - docs/llm-wiki/raw/projects/changes-log-snapshot.md
---

# Test results and lessons

See [[design-decisions|Design decisions]] for approved requirements and relational decisions.

## Local D1 verification

- `npm run db:migrate:local` exited 0; Wrangler reported `No migrations to apply!`. Source: `docs/llm-wiki/raw/projects/catalog-search-verification.md`.
- `npm run db:seed:local` exited 1 with `UNIQUE constraint failed: categories.category_id`. No database reset or destructive correction was performed. Read-only verification found the six expected tables, three categories, and fourteen books; every seed row matched the existing local rows. Source: `docs/llm-wiki/raw/projects/catalog-search-verification.md`.
- `PRAGMA foreign_key_check` returned `[]` (no violations). Source: `docs/llm-wiki/raw/projects/catalog-search-verification.md`.

## Automated tests

- After CHG-001, `npx vitest run` exited 0: **5 test files passed; 24 tests passed**, including 9 search tests. `npm run typecheck` (`tsc --noEmit`) exited 0. Source: `docs/llm-wiki/raw/projects/catalog-search-verification.md`.
- The database-integrity test file contributed 5 passing tests in the earlier full verification; the post-CHG full run total is 24 passing tests. Source: `docs/llm-wiki/raw/projects/catalog-search-verification.md`.

## CHG-001 whitespace regression

- Before the fix, `GET /api/books/search?q=database` returned HTTP 200 with 10 ordered records, while `GET /api/books/search?q=%20%20database%20%20` returned HTTP 200 with `[]`. The new AC-SEARCH-06 regression failed before implementation as expected. Sources: `docs/llm-wiki/raw/projects/catalog-search-verification.md`, `docs/llm-wiki/raw/specifications/001-catalog-search-approved.md`.
- After the fix, both requests returned HTTP 200 with identical response bodies containing 10 books in ascending IDs 1–10. `q` consisting only of spaces returned HTTP 400 with `{"error":"Search query is required"}`. Source: `docs/llm-wiki/raw/projects/catalog-search-verification.md`.
- Lesson: preserve the observed pre-fix failure as well as the passing retest; trimming must not weaken the existing empty-after-trim validation. Sources: `docs/llm-wiki/raw/projects/changes-log-snapshot.md`, `docs/llm-wiki/raw/projects/catalog-search-verification.md`.

## Extension verification status

- The University Textbook Store relational requirements are approved in the specification snapshot. Extension implementation and tests are **Not verified**. Source: `docs/llm-wiki/raw/specifications/004-university-textbook-store-approved.md`.
