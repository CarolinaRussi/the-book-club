import { useEffect, useState } from "react";
import { Card, CardContent } from "../../../ui/card";
import { Skeleton } from "../../../ui/skeleton";

function readingSkeletonCountForViewport(): number {
  if (typeof window === "undefined") return 6;
  if (window.matchMedia("(min-width: 1280px)").matches) return 10;
  if (window.matchMedia("(min-width: 1024px)").matches) return 8;
  if (window.matchMedia("(min-width: 768px)").matches) return 6;
  if (window.matchMedia("(min-width: 640px)").matches) return 5;
  return 4;
}

function useReadingSkeletonCount() {
  const [count, setCount] = useState(readingSkeletonCountForViewport);

  useEffect(() => {
    const update = () => setCount(readingSkeletonCountForViewport());
    const queries = [
      "(min-width: 640px)",
      "(min-width: 768px)",
      "(min-width: 1024px)",
      "(min-width: 1280px)",
    ].map((q) => window.matchMedia(q));
    queries.forEach((mq) => mq.addEventListener("change", update));
    update();
    return () =>
      queries.forEach((mq) => mq.removeEventListener("change", update));
  }, []);

  return count;
}

const SkeletonMyReadings = () => {
  const count = useReadingSkeletonCount();

  return (
    <div
      className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      role="status"
      aria-label="Carregando leituras"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="w-full max-w-sm mx-auto sm:max-w-none sm:mx-0 overflow-hidden py-0 gap-0"
        >
          <div className="relative aspect-2/3 overflow-hidden bg-muted">
            <Skeleton className="h-full w-full rounded-none" />
          </div>

          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Skeleton className="h-5 flex-1 max-w-[70%]" />
              <Skeleton className="h-5 w-16 shrink-0" />
            </div>
            <Skeleton className="h-4 w-2/3 max-w-40 mb-3" />
            <Skeleton className="h-4 w-full mb-3" />

            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-5 shrink-0 rounded-full sm:h-6 sm:w-6" />
                ))}
              </div>
              <Skeleton className="h-4 w-8 shrink-0" />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SkeletonMyReadings;
