INSERT INTO books (title, author, isbn, total_copies)
VALUES
  ('The Pragmatic Programmer', 'Andrew Hunt', '9780201616224', 2),
  ('Clean Code', 'Robert C. Martin', '9780132350884', 2),
  ('Domain-Driven Design', 'Eric Evans', '9780321125217', 2),
  ('Designing Data-Intensive Applications', 'Martin Kleppmann', '9781449373320', 2)
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO members (full_name, email, phone)
VALUES
  ('Aarav Sharma', 'aarav@example.com', '+919999000001'),
  ('Anaya Iyer', 'anaya@example.com', '+919999000002'),
  ('Rohan Mehta', 'rohan@example.com', '+919999000003')
ON CONFLICT (email) DO NOTHING;

WITH seeded_borrows AS (
  INSERT INTO borrow_transactions (member_id, book_id, borrowed_at, due_at, fine_cents)
  SELECT
    m.id,
    b.id,
    now() - interval '10 day',
    now() - interval '3 day',
    150
  FROM members m
  JOIN books b ON b.isbn = '9780201616224'
  WHERE m.email = 'aarav@example.com'
    AND NOT EXISTS (
      SELECT 1
      FROM borrow_transactions bt
      WHERE bt.member_id = m.id
        AND bt.book_id = b.id
        AND bt.returned_at IS NULL
    )
  UNION ALL
  SELECT
    m.id,
    b.id,
    now() - interval '2 day',
    now() + interval '12 day',
    0
  FROM members m
  JOIN books b ON b.isbn = '9780132350884'
  WHERE m.email = 'anaya@example.com'
    AND NOT EXISTS (
      SELECT 1
      FROM borrow_transactions bt
      WHERE bt.member_id = m.id
        AND bt.book_id = b.id
        AND bt.returned_at IS NULL
    )
  RETURNING book_id
)
UPDATE books b
SET copies_borrowed = COALESCE(active.active_count, 0)
FROM (
  SELECT book_id, COUNT(*)::int AS active_count
  FROM borrow_transactions
  WHERE returned_at IS NULL
  GROUP BY book_id
) active
WHERE b.id = active.book_id;
