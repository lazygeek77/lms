import { describe, expect, it } from "vitest";

import { centsToCurrency, mapRpcBooks } from "./mappers";

describe("mappers unit", () => {
  it("maps books from rpc format", () => {
    const books = mapRpcBooks([{ id: "b1", title: "T1", author: "A1", isbn: "I1" }]);
    expect(books[0].title).toBe("T1");
  });

  it("formats cents to currency", () => {
    expect(centsToCurrency(1250)).toBe("12.50");
  });
});
