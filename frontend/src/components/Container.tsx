import { ReactNode } from "react";

export function Container({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background flex flex-col items-center justify-start gap-4 min-h-screen p-20">
      {children}
    </div>
  );
}
