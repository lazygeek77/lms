from datetime import datetime, timedelta, timezone

from library_api.fine_policy import compute_fine_cents


def test_compute_fine_no_overdue() -> None:
    due = datetime.now(tz=timezone.utc) + timedelta(days=1)
    assert compute_fine_cents(due, per_day_cents=50) == 0


def test_compute_fine_overdue() -> None:
    due = datetime.now(tz=timezone.utc) - timedelta(days=3)
    assert compute_fine_cents(due, per_day_cents=100) >= 300
