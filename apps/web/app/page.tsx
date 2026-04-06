export const dynamic = "force-dynamic";
import Link from "next/link";

import { DashboardShell } from "./_components/dashboardShell";

export default async function HomePage() {
  return (
    <DashboardShell title="Library Management Dashboard" currentPath="/">
      <section style={{ background: "white", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
        <h3 style={{ marginTop: 0 }}>Choose an operation area</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <Link href="/books" style={{ textDecoration: "none", border: "1px solid #cbd5e1", borderRadius: 10, padding: 14 }}>
            <strong>Books</strong>
            <p style={{ margin: "8px 0 0", color: "#334155" }}>Create books, add copies, and view catalog details.</p>
          </Link>
          <Link href="/members" style={{ textDecoration: "none", border: "1px solid #cbd5e1", borderRadius: 10, padding: 14 }}>
            <strong>Members</strong>
            <p style={{ margin: "8px 0 0", color: "#334155" }}>Register members and review outstanding fines.</p>
          </Link>
          <Link href="/borrow" style={{ textDecoration: "none", border: "1px solid #cbd5e1", borderRadius: 10, padding: 14 }}>
            <strong>Borrow</strong>
            <p style={{ margin: "8px 0 0", color: "#334155" }}>Borrow/return books and reconcile overdues.</p>
          </Link>
        </div>
      </section>
    </DashboardShell>
  );
}
