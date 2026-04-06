import os
import uuid

import pytest

from library_api.db import Database
from library_api.repositories import LibraryRepository


pytestmark = pytest.mark.integration


def test_member_can_borrow_multiple_books() -> None:
    dsn = os.getenv("DATABASE_URL")
    if not dsn:
        pytest.skip("DATABASE_URL is required for integration tests")

    repo = LibraryRepository(Database(dsn))

    member = repo.register_member(
        full_name="Test Member Three",
        email="testm3@example.com",
        phone="+910000000003",
    )

    book1 = repo.create_book("Test Book One", "Test Author A", "1111111111", total_copies=1)
    book2 = repo.create_book("Test Book Two", "Test Author B", "2222222222", total_copies=1)

    tx1 = repo.borrow_book(str(member["id"]), str(book1["id"]), 14)
    tx2 = repo.borrow_book(str(member["id"]), str(book2["id"]), 14)

    assert tx1 is not None
    assert tx2 is not None
    assert tx1["member_id"] == tx2["member_id"]
