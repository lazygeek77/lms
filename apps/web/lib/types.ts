export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  totalCopies: number;
  copiesBorrowed: number;
};

export type Member = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  outstandingFineCents: number;
};

export type BorrowTransaction = {
  id: string;
  memberId: string;
  bookId: string;
  dueAt: string;
  borrowedAt: string;
  fineCents: number;
};

export type FineSummary = {
  memberId: string;
  outstandingFineCents: number;
};
