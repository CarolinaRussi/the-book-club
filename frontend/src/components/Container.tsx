import type { ReactNode } from "react";

export function Container({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-start gap-4 bg-cream">
      <div
        aria-hidden
        className="app-paper-texture pointer-events-none absolute inset-0"
      />
      <div className="relative z-10 flex w-full flex-col items-center gap-4">
        {children}
      </div>
    </div>
  );
}
