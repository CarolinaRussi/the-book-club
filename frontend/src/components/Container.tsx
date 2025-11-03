import { ReactNode } from "react";

export function Container({ children }: { children: ReactNode }) {
  return (
    <div className="bg-cream flex flex-col items-center justify-start gap-4 min-h-screen p-5 md:p-20">
      {children}
    </div>
  );
}
