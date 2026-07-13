export function safeRedirect(value: string | null | undefined): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/home";
}

export function redirectSearch(redirectPath: string | null | undefined): string {
  if (!redirectPath) return "";
  return `?redirect=${encodeURIComponent(redirectPath)}`;
}
