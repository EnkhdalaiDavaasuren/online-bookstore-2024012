# Online Bookstore Capstone — One-Page Proposal (Draft for student approval)

## Problem and target users
University students often struggle to identify which textbooks are required for a particular course and whether a bookstore has the right edition in stock. This project will develop an online bookstore with searchable books, catalog management, and reliable purchasing. Its target users are university students looking for course textbooks and store staff managing book information and stock.

## Individual extension: University Textbook Store
The extension connects courses to the books they require or recommend. Proposed tables: `courses` (`course_id`, `course_code`, `title`) and `course_books` (`course_id`, `book_id`, `requirement_type`). `course_books` represents the many-to-many relationship between courses and books. A composite uniqueness constraint on (`course_id`, `book_id`) will prevent duplicate associations. The existing `books` table remains the source of book price and stock data.

## User story
As a university student, I want to search by course code and see its associated textbooks so that I can find the correct books before purchasing them.

## Verifiable acceptance criteria
1. **Course-to-book relationship:** Given a course linked to two books, querying by course code returns both associated book records from the database.
2. **Duplicate prevention:** Given an existing link between a course and a book, attempting to insert the same (`course_id`, `book_id`) pair again fails with a uniqueness constraint violation; only one link remains.
3. **Referential integrity:** An attempt to associate a book or course that does not exist fails under enabled foreign-key constraints.
4. **Search correctness:** A query for a course with no associated textbooks returns an empty list, not unrelated books.

## Out of scope
The project will not include real payment processing, university enrollment integration, automatic textbook-list import from external university systems, shipping logistics, or a production-grade authentication/authorization system. The common bookstore features specified by the course are still required and will be developed separately.

> Student review required: verify the course use case and approve this extension before allowing the agent to create official specs.
