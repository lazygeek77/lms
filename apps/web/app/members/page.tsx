export const dynamic = "force-dynamic";

import { deleteMemberAction, registerMemberAction, updateMemberAction } from "../actions";
import { Card, DashboardShell } from "../_components/dashboardShell";
import { centsToCurrency } from "../../lib/mappers";
import { getMembers } from "../../lib/dashboardData";

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <DashboardShell title="Members" currentPath="/members">
      <Card title="Register Member">
        <form action={registerMemberAction} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
          <label htmlFor="register-member-full-name">Full Name</label>
          <input id="register-member-full-name" name="fullName" placeholder="e.g. Priya Nair" required />
          <small style={{ color: "#64748b" }}>Enter first and last name.</small>
          <label htmlFor="register-member-email">Email</label>
          <input id="register-member-email" name="email" placeholder="e.g. priya.nair@example.com" required />
          <small style={{ color: "#64748b" }}>Use a valid email format for notifications.</small>
          <label htmlFor="register-member-phone">Phone</label>
          <input id="register-member-phone" name="phone" placeholder="e.g. +919876543210" />
          <small style={{ color: "#64748b" }}>Include country code (optional).</small>
          <button type="submit">Register</button>
        </form>
      </Card>

      <Card title="Update Member">
        <form action={updateMemberAction} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
          <label htmlFor="update-member-id">Member ID</label>
          <input id="update-member-id" name="id" placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000" required />
          <label htmlFor="update-member-full-name">Full Name</label>
          <input id="update-member-full-name" name="fullName" placeholder="e.g. Aarav Sharma" required />
          <label htmlFor="update-member-email">Email</label>
          <input id="update-member-email" name="email" placeholder="e.g. aarav@example.com" required />
          <label htmlFor="update-member-phone">Phone</label>
          <input id="update-member-phone" name="phone" placeholder="e.g. +919999000001" />
          <button type="submit">Update</button>
        </form>
      </Card>

      <Card title="Delete Member">
        <form action={deleteMemberAction} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
          <label htmlFor="delete-member-id">Member ID</label>
          <input id="delete-member-id" name="id" placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000" required />
          <button type="submit">Delete</button>
        </form>
      </Card>

      <Card title="Members List">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Name</th>
                <th align="left">Email</th>
                <th align="left">Phone</th>
                <th align="left">Outstanding Fine</th>
                <th align="left">Member ID</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{member.fullName}</td>
                  <td>{member.email}</td>
                  <td>{member.phone || "-"}</td>
                  <td>₹ {centsToCurrency(member.outstandingFineCents)}</td>
                  <td>{member.id}</td>
                </tr>
              ))}
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5}>No members registered.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardShell>
  );
}
