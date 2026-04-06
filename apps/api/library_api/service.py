from datetime import timezone

import grpc
import psycopg
from google.protobuf.timestamp_pb2 import Timestamp

from .fine_policy import compute_fine_cents
from .repositories import LibraryRepository

from library.v1 import library_pb2, library_pb2_grpc


class LibraryService(library_pb2_grpc.LibraryServiceServicer):
    def __init__(self, repo: LibraryRepository, fine_per_day_cents: int) -> None:
        self.repo = repo
        self.fine_per_day_cents = fine_per_day_cents

    @staticmethod
    def _timestamp(value) -> Timestamp:
        ts = Timestamp()
        if value is not None:
            ts.FromDatetime(value.astimezone(timezone.utc))
        return ts

    def Health(self, request, context):
        return library_pb2.HealthResponse(status="ok")

    def _book_msg(self, row):
        return library_pb2.Book(
            id=str(row["id"]),
            title=row["title"],
            author=row["author"],
            isbn=row["isbn"],
            total_copies=int(row.get("total_copies") or 0),
            copies_borrowed=int(row.get("copies_borrowed") or 0),
            created_at=self._timestamp(row["created_at"]),
        )

    def _member_msg(self, row):
        return library_pb2.Member(
            id=str(row["id"]),
            full_name=row["full_name"],
            email=row["email"],
            phone=row.get("phone") or "",
            outstanding_fine_cents=int(row.get("outstanding_fine_cents") or 0),
            created_at=self._timestamp(row["created_at"]),
        )

    def _tx_msg(self, row):
        tx = library_pb2.BorrowTransaction(
            id=str(row["id"]),
            member_id=str(row["member_id"]),
            book_id=str(row["book_id"]),
            borrowed_at=self._timestamp(row["borrowed_at"]),
            due_at=self._timestamp(row["due_at"]),
            fine_cents=int(row.get("fine_cents") or 0),
        )
        if row.get("returned_at"):
            tx.returned_at.CopyFrom(self._timestamp(row["returned_at"]))
        return tx

    def CreateBook(self, request, context):
        try:
            row = self.repo.create_book(request.title, request.author, request.isbn, request.total_copies)
        except Exception as exc:  # pragma: no cover
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, str(exc))
        return library_pb2.CreateBookResponse(book=self._book_msg(row))

    def UpdateBook(self, request, context):
        try:
            row = self.repo.update_book(request.id, request.title, request.author, request.isbn, request.total_copies)
        except Exception as exc:  # pragma: no cover
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, str(exc))
        if not row:
            context.abort(grpc.StatusCode.NOT_FOUND, "Book not found")
        return library_pb2.UpdateBookResponse(book=self._book_msg(row))

    def DeleteBook(self, request, context):
        try:
            deleted = self.repo.delete_book(request.id)
        except psycopg.errors.ForeignKeyViolation:
            context.abort(
                grpc.StatusCode.FAILED_PRECONDITION,
                "Cannot delete this book while borrow transactions still reference it",
            )
        except Exception as exc:  # pragma: no cover
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, str(exc))
        return library_pb2.DeleteBookResponse(deleted=deleted)

    def ListBooks(self, request, context):
        return library_pb2.ListBooksResponse(books=[self._book_msg(r) for r in self.repo.list_books()])

    def RegisterMember(self, request, context):
        try:
            row = self.repo.register_member(request.full_name, request.email, request.phone)
        except Exception as exc:  # pragma: no cover
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, str(exc))
        return library_pb2.RegisterMemberResponse(member=self._member_msg(row))

    def UpdateMember(self, request, context):
        try:
            row = self.repo.update_member(request.id, request.full_name, request.email, request.phone)
        except Exception as exc:  # pragma: no cover
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, str(exc))
        if not row:
            context.abort(grpc.StatusCode.NOT_FOUND, "Member not found")
        return library_pb2.UpdateMemberResponse(member=self._member_msg(row))

    def DeleteMember(self, request, context):
        try:
            deleted = self.repo.delete_member(request.id)
        except Exception as exc:  # pragma: no cover
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, str(exc))
        return library_pb2.DeleteMemberResponse(deleted=deleted)

    def ListMembers(self, request, context):
        rows = self.repo.list_members()
        return library_pb2.ListMembersResponse(members=[self._member_msg(r) for r in rows])

    def BorrowBook(self, request, context):
        loan_days = request.loan_days or 14
        row = self.repo.borrow_book(
            member_id=request.member_id,
            book_id=request.book_id,
            loan_days=loan_days,
        )
        if not row:
            context.abort(grpc.StatusCode.FAILED_PRECONDITION, "No available copy for this book")
        return library_pb2.BorrowBookResponse(transaction=self._tx_msg(row))

    def ReturnBook(self, request, context):
        tx = self.repo.get_transaction(request.borrow_transaction_id)
        if not tx:
            context.abort(grpc.StatusCode.NOT_FOUND, "Borrow transaction not found")
        if tx["returned_at"] is not None:
            context.abort(grpc.StatusCode.FAILED_PRECONDITION, "Transaction already returned")

        fine_cents = compute_fine_cents(tx["due_at"], self.fine_per_day_cents)
        row = self.repo.return_book(request.borrow_transaction_id, fine_cents)
        if not row:
            context.abort(grpc.StatusCode.INTERNAL, "Unable to return book")

        return library_pb2.ReturnBookResponse(transaction=self._tx_msg(row))

    def ExtendBorrow(self, request, context):
        row = self.repo.extend_borrow(request.borrow_transaction_id, request.extend_days or 7)
        if not row:
            context.abort(grpc.StatusCode.NOT_FOUND, "Borrow transaction not found or already returned")
        return library_pb2.ExtendBorrowResponse(transaction=self._tx_msg(row))

    def ListBorrowedBooks(self, request, context):
        rows = self.repo.list_borrowed_books(
            member_id=request.member_id or None,
            overdue_only=request.overdue_only,
        )
        return library_pb2.ListBorrowedBooksResponse(transactions=[self._tx_msg(r) for r in rows])

    def ReconcileOverdues(self, request, context):
        applied = self.repo.reconcile_overdues(self.fine_per_day_cents)
        return library_pb2.ReconcileOverduesResponse(fines_applied=applied)

    def GetMemberFineSummary(self, request, context):
        total, events = self.repo.member_fine_summary(request.member_id)
        event_messages = [
            library_pb2.FineEvent(
                id=str(e["id"]),
                member_id=str(e["member_id"]),
                borrow_transaction_id=str(e["borrow_transaction_id"]) if e["borrow_transaction_id"] else "",
                amount_cents=int(e["amount_cents"]),
                reason=e["reason"],
                created_at=self._timestamp(e["created_at"]),
            )
            for e in events
        ]

        return library_pb2.GetMemberFineSummaryResponse(
            member_id=request.member_id,
            outstanding_fine_cents=total,
            fine_events=event_messages,
        )
