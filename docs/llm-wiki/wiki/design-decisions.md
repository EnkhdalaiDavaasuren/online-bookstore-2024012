---
title: Design decisions
type: concept
tags: [bookstore]
created: 2026-11-20
updated: 2026-11-20
sources:
  - docs/llm-wiki/raw/specifications/001-catalog-search-approved.md
  - docs/llm-wiki/raw/specifications/004-university-textbook-store-approved.md
  - docs/llm-wiki/raw/projects/changes-log-snapshot.md
  - docs/llm-wiki/raw/proposal.md
---

# Design decisions

See [[test-results-and-lessons|Test results and lessons]] for execution evidence.

## Core catalog and search

- The approved catalog exposes book listing, book detail, book search, and category listing. Search is ASCII case-insensitive substring matching over title/author, ordered by ascending book ID, with a maximum of 10 results. Source: `docs/llm-wiki/raw/specifications/001-catalog-search-approved.md`.
- CHG-001 approves trimming leading/trailing search-query whitespace before matching; if the trimmed query is empty, the existing HTTP 400 JSON error is returned. The ordering, case-insensitive matching, and 10-result maximum remain. Source: `docs/llm-wiki/raw/specifications/001-catalog-search-approved.md`; rationale and approval record: `docs/llm-wiki/raw/projects/changes-log-snapshot.md`.
- Book monetary values use USD integer cents; book records include `price_cents`, and existing book price/stock remain part of the core catalog. Source: `docs/llm-wiki/raw/specifications/001-catalog-search-approved.md`.

## Verified local D1 state

- Local database name: `bookstore-db-3`. The six expected core tables are `categories`, `books`, `customers`, `orders`, `order_items`, and `order_events`. Source: `docs/llm-wiki/raw/projects/catalog-search-verification.md`.
- The initial local migration command exited 0 with Wrangler reporting “No migrations to apply.” The seed command failed with `UNIQUE constraint failed: categories.category_id`; subsequent read-only inspection found all 3 categories and 14 books matching the seed records. Source: `docs/llm-wiki/raw/projects/catalog-search-verification.md`.
- `PRAGMA foreign_key_check` returned `[]`. Source: `docs/llm-wiki/raw/projects/catalog-search-verification.md`.

## University Textbook Store extension

- The approved extension specifies `courses(course_id, course_code, title)` and `course_books(course_id, book_id, requirement_type)` to represent the many-to-many course/book relation. The association uses a unique `(course_id, book_id)` pair, valid references to courses and existing books, and `requirement_type` values `required` or `recommended`. Source: `docs/llm-wiki/raw/specifications/004-university-textbook-store-approved.md`; originating proposal: `docs/llm-wiki/raw/proposal.md`.
- The extension design keeps book attributes in the existing books relation and places `requirement_type` on the association, where it depends on the course-book pair. This is the approved 3NF rationale. Source: `docs/llm-wiki/raw/specifications/004-university-textbook-store-approved.md`.
- Extension migrations, API behavior, and runtime enforcement are **Not verified**; the evidence establishes an approved specification, not implementation. Source: `docs/llm-wiki/raw/specifications/004-university-textbook-store-approved.md`.
