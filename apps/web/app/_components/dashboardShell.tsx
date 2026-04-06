import Link from "next/link";
import type { ReactNode } from "react";

const navLinkStyle = {
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  color: "#0f172a",
  background: "white",
  fontWeight: 600,
} as const;

const activeNavLinkStyle = {
  ...navLinkStyle,
  border: "1px solid #2563eb",
  background: "#eff6ff",
  color: "#1d4ed8",
} as const;

function getNavLinkStyle(currentPath: string, href: string) {
  return currentPath === href ? activeNavLinkStyle : navLinkStyle;
}

export function DashboardShell({ title, currentPath, children }: { title: string; currentPath: string; children: ReactNode }) {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24, display: "grid", gap: 16 }}>
      <header style={{ display: "grid", gap: 10 }}>
        <h1 style={{ margin: 0 }}>{title}</h1>
        <nav style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/" style={getNavLinkStyle(currentPath, "/")}>
            Dashboard
          </Link>
          <Link href="/books" style={getNavLinkStyle(currentPath, "/books")}>
            Books
          </Link>
          <Link href="/members" style={getNavLinkStyle(currentPath, "/members")}>
            Members
          </Link>
          <Link href="/borrow" style={getNavLinkStyle(currentPath, "/borrow")}>
            Borrow
          </Link>
        </nav>
      </header>
      {children}
    </main>
  );
}

export function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ background: "white", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </section>
  );
}
