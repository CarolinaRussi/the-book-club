export function buildReadingDrawShareUrl(shareCode: string): string {
  return `${window.location.origin}/sorteio/${shareCode}`;
}
