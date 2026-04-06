export const dynamic = "force-dynamic";

import { createBookAction, deleteBookAction, updateBookAction } from "../actions";
import { Card, DashboardShell } from "../_components/dashboardShell";
import { getBooks } from "../../lib/dashboardData";

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <DashboardShell title="Books" currentPath="/books">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <Card title="Create Book">
          <form action={createBookAction} style={{ display: "grid", gap: 8 }}>
            <label htmlFor="create-book-title">Book Title</label>
            <input id="create-book-title" name="title" placeholder="e.g. The Pragmatic Programmer" required />
            <small style={{ color: "#64748b" }}>Use the full book title as shown on the cover.</small>
            <label htmlFor="create-book-author">Author</label>
            <input id="create-book-author" name="author" placeholder="e.g. Andrew Hunt" required />
            <small style={{ color: "#64748b" }}>Author name in plain text.</small>
            <label htmlFor="create-book-isbn">ISBN</label>
            <input id="create-book-isbn" name="isbn" placeholder="e.g. 9780201616224" required />
            <small style={{ color: "#64748b" }}>Enter 10 or 13 digit ISBN without spaces.</small>
            <label htmlFor="create-book-total-copies">Total Copies</label>
            <input id="create-book-total-copies" name="totalCopies" type="number" min={0} defaultValue={1} required />
            <button type="submit">Create</button>
          </form>
        </Card>

        <Card title="Update Book">
          <form action={updateBookAction} style={{ display: "grid", gap: 8 }}>
            <label htmlFor="update-book-id">Book ID</label>
            <input id="update-book-id" name="id" placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000" required />
            <label htmlFor="update-book-title">Book Title</label>
            <input id="update-book-title" name="title" placeholder="e.g. Clean Code" required />
            <label htmlFor="update-book-author">Author</label>
            <input id="update-book-author" name="author" placeholder="e.g. Robert C. Martin" required />
            <label htmlFor="update-book-isbn">ISBN</label>
            <input id="update-book-isbn" name="isbn" placeholder="e.g. 9780132350884" required />
            <label htmlFor="update-book-total-copies">Total Copies</label>
            <input id="update-book-total-copies" name="totalCopies" type="number" min={0} defaultValue={1} required />
            <button type="submit">Update</button>
          </form>
        </Card>

        <Card title="Delete Book">
          <form action={deleteBookAction} style={{ display: "grid", gap: 8 }}>
            <label htmlFor="delete-book-id">Book ID</label>
            <input id="delete-book-id" name="id" placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000" required />
            <button type="submit">Delete</button>
          </form>
        </Card>

      </div>
      <Card title="Book Catalog">

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Title</th>
                <th align="left">Author</th>
                <th align="left">ISBN</th>
                <th align="left">Available / Total</th>
                <th align="left">Book ID</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.isbn}</td>
                  <td>{Math.max(book.totalCopies - book.copiesBorrowed, 0)} / {book.totalCopies}</td>
                  <td>{book.id}</td>
                </tr>
              ))}
              {books.length === 0 ? (
                <tr>
                  <td colSpan={5}>No books available.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardShell>
  );
}
