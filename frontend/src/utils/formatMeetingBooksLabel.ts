type MeetingBookLabelSource = {
  title: string;
};

export function formatMeetingBooksLabel(
  books: MeetingBookLabelSource[] | null | undefined,
  maxLength = 60
): string {
  if (!books || books.length === 0) {
    return "Sem livro";
  }

  const joined = books.map((book) => book.title).join(" · ");
  if (joined.length <= maxLength) {
    return joined;
  }
  if (maxLength <= 1) {
    return "…";
  }
  return `${joined.slice(0, maxLength - 1)}…`;
}
