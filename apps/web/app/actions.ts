"use server";

import { revalidatePath } from "next/cache";

import { callRpc } from "../lib/grpcClient";

function formatActionError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Unknown error";
  }

  const cleaned = error.message.replace(/^\d+\s+[A-Z_]+:\s*/, "").trim();
  return cleaned || "Unknown error";
}

function revalidateDashboardRoutes() {
  revalidatePath("/");
  revalidatePath("/books");
  revalidatePath("/members");
  revalidatePath("/borrow");
}

async function safeAction(action: () => Promise<void>) {
  try {
    await action();
  } catch (error) {
    throw new Error(formatActionError(error));
  }
}

export async function createBookAction(formData: FormData) {
  await safeAction(async () => {
    await callRpc("CreateBook", {
      title: String(formData.get("title") ?? ""),
      author: String(formData.get("author") ?? ""),
      isbn: String(formData.get("isbn") ?? ""),
      totalCopies: Number(formData.get("totalCopies") ?? 1),
    });
  });
  revalidateDashboardRoutes();
}

export async function updateBookAction(formData: FormData) {
  await safeAction(async () => {
    await callRpc("UpdateBook", {
      id: String(formData.get("id") ?? ""),
      title: String(formData.get("title") ?? ""),
      author: String(formData.get("author") ?? ""),
      isbn: String(formData.get("isbn") ?? ""),
      totalCopies: Number(formData.get("totalCopies") ?? 1),
    });
  });
  revalidateDashboardRoutes();
}

export async function deleteBookAction(formData: FormData) {
  await safeAction(async () => {
    await callRpc("DeleteBook", {
      id: String(formData.get("id") ?? ""),
    });
  });
  revalidateDashboardRoutes();
}

export async function registerMemberAction(formData: FormData) {
  await safeAction(async () => {
    await callRpc("RegisterMember", {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    });
  });
  revalidateDashboardRoutes();
}

export async function updateMemberAction(formData: FormData) {
  await safeAction(async () => {
    await callRpc("UpdateMember", {
      id: String(formData.get("id") ?? ""),
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    });
  });
  revalidateDashboardRoutes();
}

export async function deleteMemberAction(formData: FormData) {
  await safeAction(async () => {
    await callRpc("DeleteMember", {
      id: String(formData.get("id") ?? ""),
    });
  });
  revalidateDashboardRoutes();
}

export async function borrowBookAction(formData: FormData) {
  await safeAction(async () => {
    await callRpc("BorrowBook", {
      memberId: String(formData.get("memberId") ?? ""),
      bookId: String(formData.get("bookId") ?? ""),
      loanDays: Number(formData.get("loanDays") ?? 14),
    });
  });
  revalidateDashboardRoutes();
}

export async function returnBookAction(formData: FormData) {
  await safeAction(async () => {
    await callRpc("ReturnBook", {
      borrowTransactionId: String(formData.get("transactionId") ?? ""),
    });
  });
  revalidateDashboardRoutes();
}

export async function extendBorrowAction(formData: FormData) {
  await safeAction(async () => {
    await callRpc("ExtendBorrow", {
      borrowTransactionId: String(formData.get("transactionId") ?? ""),
      extendDays: Number(formData.get("extendDays") ?? 7),
    });
  });
  revalidateDashboardRoutes();
}

export async function reconcileOverduesAction() {
  await safeAction(async () => {
    await callRpc("ReconcileOverdues", {});
  });
  revalidateDashboardRoutes();
}
