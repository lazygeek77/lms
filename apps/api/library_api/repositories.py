from datetime import datetime, timedelta, timezone
from typing import Any

from .db import Database


class LibraryRepository:
    def __init__(self, db: Database) -> None:
        self.db = db

    def create_book(self, title: str, author: str, isbn: str, total_copies: int = 1) -> dict[str, Any]:
        with self.db.conn() as conn:
            return conn.execute(
                """
                INSERT INTO books(title, author, isbn, total_copies)
                VALUES (%s, %s, %s, %s)
                RETURNING *
                """,
                (title, author, isbn, max(0, total_copies)),
            ).fetchone()

    def list_books(self) -> list[dict[str, Any]]:
        with self.db.conn() as conn:
            return conn.execute("SELECT * FROM books ORDER BY created_at DESC").fetchall()

    def update_book(self, book_id: str, title: str, author: str, isbn: str, total_copies: int) -> dict[str, Any] | None:
        with self.db.conn() as conn:
            return conn.execute(
                """
                UPDATE books
                SET title=%s, author=%s, isbn=%s, total_copies=%s
                WHERE id=%s
                RETURNING *
                """,
                (title, author, isbn, max(0, total_copies), book_id),
            ).fetchone()

    def delete_book(self, book_id: str) -> bool:
        with self.db.conn() as conn:
            result = conn.execute("DELETE FROM books WHERE id=%s", (book_id,))
            return result.rowcount > 0

    def register_member(self, full_name: str, email: str, phone: str) -> dict[str, Any]:
        with self.db.conn() as conn:
            return conn.execute(
                """
                INSERT INTO members(full_name, email, phone)
                VALUES (%s, %s, %s)
                RETURNING *
                """,
                (full_name, email, phone),
            ).fetchone()

    def list_members(self) -> list[dict[str, Any]]:
        with self.db.conn() as conn:
            return conn.execute(
                """
                SELECT m.*, COALESCE(SUM(f.amount_cents), 0) AS outstanding_fine_cents
                FROM members m
                LEFT JOIN member_fines f ON f.member_id = m.id
                GROUP BY m.id
                ORDER BY m.created_at DESC
                """
            ).fetchall()

    def update_member(self, member_id: str, full_name: str, email: str, phone: str) -> dict[str, Any] | None:
        with self.db.conn() as conn:
            return conn.execute(
                """
                UPDATE members
                SET full_name=%s, email=%s, phone=%s
                WHERE id=%s
                RETURNING *
                """,
                (full_name, email, phone, member_id),
            ).fetchone()

    def delete_member(self, member_id: str) -> bool:
        with self.db.conn() as conn:
            result = conn.execute("DELETE FROM members WHERE id=%s", (member_id,))
            return result.rowcount > 0

    def borrow_book(
        self,
        member_id: str,
        book_id: str,
        loan_days: int,
    ) -> dict[str, Any] | None:
        with self.db.conn() as conn:
            book_row = conn.execute(
                """
                SELECT id, total_copies, copies_borrowed
                FROM books
                WHERE id=%s
                FOR UPDATE
                """,
                (book_id,),
            ).fetchone()
            if not book_row:
                return None
            if int(book_row["copies_borrowed"]) >= int(book_row["total_copies"]):
                return None

            due_at = datetime.now(tz=timezone.utc) + timedelta(days=max(1, loan_days))
            tx = conn.execute(
                """
                INSERT INTO borrow_transactions(member_id, book_id, due_at)
                VALUES (%s, %s, %s)
                RETURNING *
                """,
                (member_id, book_id, due_at),
            ).fetchone()
            conn.execute(
                "UPDATE books SET copies_borrowed = copies_borrowed + 1 WHERE id=%s",
                (book_id,),
            )
            return tx

    def return_book(self, transaction_id: str, fine_cents: int) -> dict[str, Any] | None:
        with self.db.conn() as conn:
            tx = conn.execute(
                "SELECT * FROM borrow_transactions WHERE id=%s",
                (transaction_id,),
            ).fetchone()
            if not tx or tx["returned_at"] is not None:
                return None

            updated = conn.execute(
                """
                UPDATE borrow_transactions
                SET returned_at=now(), fine_cents=%s
                WHERE id=%s
                RETURNING *
                """,
                (fine_cents, transaction_id),
            ).fetchone()
            conn.execute(
                "UPDATE books SET copies_borrowed = GREATEST(copies_borrowed - 1, 0) WHERE id=%s",
                (tx["book_id"],),
            )

            if fine_cents > 0:
                conn.execute(
                    """
                    INSERT INTO member_fines(member_id, borrow_transaction_id, amount_cents, reason)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (tx["member_id"], tx["id"], fine_cents, "OVERDUE_RETURN"),
                )

            return updated

    def extend_borrow(self, transaction_id: str, extend_days: int) -> dict[str, Any] | None:
        with self.db.conn() as conn:
            tx = conn.execute(
                "SELECT * FROM borrow_transactions WHERE id=%s",
                (transaction_id,),
            ).fetchone()
            if not tx or tx["returned_at"] is not None:
                return None

            days = max(1, extend_days)
            return conn.execute(
                """
                UPDATE borrow_transactions
                SET due_at = due_at + (%s::int * interval '1 day')
                WHERE id=%s
                RETURNING *
                """,
                (days, transaction_id),
            ).fetchone()

    def list_borrowed_books(self, member_id: str | None, overdue_only: bool) -> list[dict[str, Any]]:
        with self.db.conn() as conn:
            where = ["returned_at IS NULL"]
            args: list[Any] = []

            if member_id:
                where.append("member_id=%s")
                args.append(member_id)
            if overdue_only:
                where.append("due_at < now()")

            query = f"""
                SELECT * FROM borrow_transactions
                WHERE {' AND '.join(where)}
                ORDER BY borrowed_at DESC
            """
            return conn.execute(query, tuple(args)).fetchall()

    def member_fine_summary(self, member_id: str) -> tuple[int, list[dict[str, Any]]]:
        with self.db.conn() as conn:
            events = conn.execute(
                "SELECT * FROM member_fines WHERE member_id=%s ORDER BY created_at DESC",
                (member_id,),
            ).fetchall()
            total = sum(int(e["amount_cents"]) for e in events)
            return total, events

    def get_transaction(self, transaction_id: str) -> dict[str, Any] | None:
        with self.db.conn() as conn:
            return conn.execute(
                "SELECT * FROM borrow_transactions WHERE id=%s",
                (transaction_id,),
            ).fetchone()
