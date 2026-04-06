# Architecture Notes

## Call path

All API calls are implemented via Next.js Server Actions.

1. User submits forms in Next.js App Router pages.
2. Server Actions invoke gRPC methods via `@grpc/grpc-js` and protobuf contract.
3. Python `grpcio` service applies business rules and persists state in PostgreSQL.

## Contract ownership

- Source of truth: `packages/proto/library/v1/library.proto`
- Backend uses generated Python stubs.
- Frontend uses proto at runtime through loader and can consume generated TS artifacts.

## Domain model highlights

- `books` describes catalog entries.
- `books.total_copies` and `books.copies_borrowed` model available inventory per title.
- `borrow_transactions` tracks active/history loans at book level.
- `member_fines` tracks overdue-derived fines tied to members.

## Overdue/fine policy

- Fine is computed from overdue days (`due_at` vs current time).
- Daily fine amount is configurable via `FINE_PER_DAY_CENTS`.
- Reconciliation endpoint applies incremental fine entries for overdue active loans.
