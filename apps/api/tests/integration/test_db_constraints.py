import os
import uuid

import pytest

from library_api.db import Database
from library_api.repositories import LibraryRepository


pytestmark = pytest.mark.integration


def test_same_copy_cannot_be_double_borrowed() -> None:
    dsn = os.getenv("DATABASE_URL")
    if not dsn:
        pytest.skip("DATABASE_URL is required for integration tests")

    repo = LibraryRepository(Database(dsn))

    member1 = repo.register_member(
        full_name="Test Member One",
        email=f"m1@example.com",
        phone="+910000000001",
    )
    member2 = repo.register_member(
        full_name="Test Member Two",
        email=f"m2@example.com",
        phone="+910000000002",
    )

    book = repo.create_book("Prisoner of Azkaban", "J.K. Rowling", f"9999999999", total_copies=1)

    first_tx = repo.borrow_book(
        member_id=str(member1["id"]),
        book_id=str(book["id"]),
        loan_days=7,
    )
    second_tx = repo.borrow_book(
        member_id=str(member2["id"]),
        book_id=str(book["id"]),
        loan_days=7,
    )

    assert first_tx is not None
    assert second_tx is None
