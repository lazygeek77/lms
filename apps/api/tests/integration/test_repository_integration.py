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
        full_name=f"Test Member {uuid.uuid4()}",
        email=f"member-{uuid.uuid4()}@example.com",
        phone="+910000000000",
    )

    book1 = repo.create_book(f"Book-{uuid.uuid4()}", "Author A", f"ISBN-{uuid.uuid4()}", total_copies=1)
    book2 = repo.create_book(f"Book-{uuid.uuid4()}", "Author B", f"ISBN-{uuid.uuid4()}", total_copies=1)

    tx1 = repo.borrow_book(str(member["id"]), str(book1["id"]), 14)
    tx2 = repo.borrow_book(str(member["id"]), str(book2["id"]), 14)

    assert tx1 is not None
    assert tx2 is not None
    assert tx1["member_id"] == tx2["member_id"]
