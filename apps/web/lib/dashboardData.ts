import { callRpc } from "./grpcClient";
import { mapRpcBooks, mapRpcMembers } from "./mappers";
import { Book, BorrowTransaction, Member } from "./types";

function normalizeTimestamp(value: unknown): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value !== null && "seconds" in value) {
    const rawSeconds = (value as { seconds?: string | number }).seconds;
    const seconds = Number(rawSeconds ?? 0);
    if (!Number.isFinite(seconds)) {
      return "";
    }
    return new Date(seconds * 1000).toISOString();
  }

  return "";
}

export async function getBooks(): Promise<Book[]> {
  try {
    const response = await callRpc<any, { books: Array<any> }>("ListBooks", {});
    return mapRpcBooks(response.books ?? []);
  } catch {
    return [];
  }
}

export async function getMembers(): Promise<Member[]> {
  try {
    const response = await callRpc<any, { members: Array<any> }>("ListMembers", {});
    return mapRpcMembers(response.members ?? []);
  } catch {
    return [];
  }
}

export async function getBorrowTransactions(overdueOnly = false): Promise<BorrowTransaction[]> {
  try {
    const response = await callRpc<any, { transactions: Array<any> }>("ListBorrowedBooks", {
      overdueOnly,
      memberId: "",
    });

    return (response.transactions ?? []).map((transaction) => ({
      id: transaction.id,
      memberId: transaction.memberId,
      bookId: transaction.bookId,
      borrowedAt: normalizeTimestamp(transaction.borrowedAt),
      dueAt: normalizeTimestamp(transaction.dueAt),
      fineCents: Number(transaction.fineCents ?? 0),
    }));
  } catch {
    return [];
  }
}
