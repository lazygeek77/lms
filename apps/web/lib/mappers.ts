type RpcBook = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  totalCopies?: number | string;
  copiesBorrowed?: number | string;
};
type RpcMember = { id: string; fullName: string; email: string; phone?: string; outstandingFineCents?: number | string };

export function mapRpcBooks(books: RpcBook[]) {
  return books.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    totalCopies: Number(book.totalCopies ?? 0),
    copiesBorrowed: Number(book.copiesBorrowed ?? 0),
  }));
}

export function mapRpcMembers(members: RpcMember[]) {
  return members.map((member) => ({
    id: member.id,
    fullName: member.fullName,
    email: member.email,
    phone: member.phone ?? "",
    outstandingFineCents: Number(member.outstandingFineCents ?? 0),
  }));
}

export function centsToCurrency(cents: number) {
  return (cents / 100).toFixed(2);
}
