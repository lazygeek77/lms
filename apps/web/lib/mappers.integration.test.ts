import { describe, expect, it } from "vitest";

import { mapRpcMembers } from "./mappers";

describe("mappers integration", () => {
  it("normalizes optional fine and phone fields for dashboard rendering", () => {
    const members = mapRpcMembers([
      { id: "m1", fullName: "User One", email: "u1@example.com", outstandingFineCents: "150" },
      { id: "m2", fullName: "User Two", email: "u2@example.com" },
    ]);

    expect(members[0].outstandingFineCents).toBe(150);
    expect(members[1].phone).toBe("");
    expect(members[1].outstandingFineCents).toBe(0);
  });
});
