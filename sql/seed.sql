-- Synthetic catalog fixtures only; all prices are USD integer cents.
INSERT INTO categories (category_id, name, description) VALUES
    (1, 'Databases', 'Synthetic database and data-modeling titles'),
    (2, 'Computing', 'Synthetic general computing titles'),
    (3, 'Literature', 'Synthetic fiction titles');

INSERT INTO books (book_id, category_id, title, author, isbn, price_cents, stock) VALUES
    (1, 1, 'Database Foundations', 'Avery Example', '9780000000001', 2499, 8),
    (2, 1, 'Database Design Basics', 'Blake Sample', '9780000000002', 3199, 5),
    (3, 1, 'Advanced Database Systems', 'Casey Demo', '9780000000003', 4299, 4),
    (4, 1, 'Database Theory Workbook', 'Drew Fictional', '9780000000004', 1999, 12),
    (5, 1, 'Reliable Database Applications', 'Emery Test', '9780000000005', 3599, 3),
    (6, 1, 'Database Indexing in Practice', 'Finley Example', '9780000000006', 2899, 6),
    (7, 1, 'Modern Database Concepts', 'Gray Sample', '9780000000007', 3999, 2),
    (8, 1, 'Database Query Patterns', 'Harper Demo', '9780000000008', 2799, 9),
    (9, 1, 'Database Systems Review', 'Indigo Fictional', '9780000000009', 2299, 7),
    (10, 1, 'Building Database Services', 'Jules Test', '9780000000010', 4499, 1),
    (11, 1, 'Database Security Essentials', 'Kai Example', '9780000000011', 3399, 4),
    (12, 1, 'Database Performance Notes', 'Lane Sample', '9780000000012', 2999, 5),
    (13, 2, 'Practical SQL Patterns', 'Morgan Demo', '9780000000013', 1899, 10),
    (14, 3, 'The Paper Lantern', 'Nico Fictional', '9780000000014', 1599, 14);
