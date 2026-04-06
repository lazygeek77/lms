from datetime import datetime, timezone


def compute_fine_cents(due_at: datetime, per_day_cents: int, returned_at: datetime | None = None) -> int:
    effective_time = returned_at or datetime.now(tz=timezone.utc)
    if effective_time <= due_at:
        return 0

    overdue_days = (effective_time.date() - due_at.date()).days
    if overdue_days <= 0:
        return 0

    return overdue_days * per_day_cents
