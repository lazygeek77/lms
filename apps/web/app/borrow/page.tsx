export const dynamic = "force-dynamic";

import { borrowBookAction, extendBorrowAction, reconcileOverduesAction, returnBookAction } from "../actions";
import { Card, DashboardShell } from "../_components/dashboardShell";
import { getBooks, getBorrowTransactions, getMembers } from "../../lib/dashboardData";
import { centsToCurrency } from "../../lib/mappers";

function formatDate(value: string) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function BorrowPage() {
  const [members, books, transactions] = await Promise.all([getMembers(), getBooks(), getBorrowTransactions(false)]);
  const memberNames = new Map(members.map((member) => [member.id, member.fullName]));
  const bookNames = new Map(books.map((book) => [book.id, book.title]));

  return (
    <DashboardShell title="Borrow Operations" currentPath="/borrow">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <Card title="Borrow Book">
          <form action={borrowBookAction} style={{ display: "grid", gap: 8 }}>
            <label htmlFor="borrow-member-id">Member</label>
            <select id="borrow-member-id" name="memberId" required>
              <option value="">Select member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.fullName}
                </option>
              ))}
            </select>
            <small style={{ color: "#64748b" }}>Choose the member who is borrowing the book.</small>
            <label htmlFor="borrow-book-id">Book</label>
            <select id="borrow-book-id" name="bookId" required>
              <option value="">Select book</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
            <small style={{ color: "#64748b" }}>Pick the catalog title to borrow.</small>
            <label htmlFor="borrow-loan-days">Loan Days</label>
            <input id="borrow-loan-days" name="loanDays" type="number" min={1} defaultValue={14} />
            <small style={{ color: "#64748b" }}>Loan duration in days (default 14).</small>
            <button type="submit">Borrow</button>
          </form>
        </Card>

        <Card title="Overdue Reconciliation">
          <p style={{ marginTop: 0 }}>Apply overdue fines for all currently overdue and unreturned loans.</p>
          <form action={reconcileOverduesAction}>
            <button type="submit">Reconcile Overdues</button>
          </form>
        </Card>
      </div>

      <Card title="Active Borrow Transactions">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Member</th>
                <th align="left">Book</th>
                <th align="left">Borrowed Date</th>
                <th align="left">Return Date</th>
                <th align="left">Fine</th>
                <th align="left">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{memberNames.get(transaction.memberId) ?? transaction.memberId}</td>
                  <td>{bookNames.get(transaction.bookId) ?? transaction.bookId}</td>
                  <td>{formatDate(transaction.borrowedAt)}</td>
                  <td>{formatDate(transaction.dueAt)}</td>
                  <td>₹ {centsToCurrency(transaction.fineCents)}</td>
                  <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <form action={returnBookAction} style={{ margin: 0 }}>
                      <input type="hidden" name="transactionId" value={transaction.id} />
                      <button type="submit">Return</button>
                    </form>
                    <form action={extendBorrowAction} style={{ display: "flex", gap: 6, alignItems: "center", margin: 0 }}>
                      <input type="hidden" name="transactionId" value={transaction.id} />
                      <label htmlFor={`extend-days-${transaction.id}`}>Days</label>
                      <input id={`extend-days-${transaction.id}`} name="extendDays" type="number" min={1} defaultValue={7} style={{ width: 72 }} />
                      <button type="submit">Extend</button>
                    </form>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6}>No active loans.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardShell>
  );
}
