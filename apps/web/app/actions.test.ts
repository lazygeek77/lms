import { describe, expect, it } from "vitest";

import { borrowBookAction } from "./actions";

describe("borrowBookAction", () => {
  it("throws for missing grpc endpoint in test env only when called", async () => {
    const formData = new FormData();
    formData.set("memberId", "member-1");
    formData.set("bookId", "book-1");
    formData.set("loanDays", "7");

    await expect(borrowBookAction(formData)).rejects.toBeDefined();
  });
});
