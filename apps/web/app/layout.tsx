import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Library Management System",
  description: "LMS with Next.js Server Actions and gRPC backend",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui, sans-serif", background: "#f7fafc" }}>
        {children}
      </body>
    </html>
  );
}
