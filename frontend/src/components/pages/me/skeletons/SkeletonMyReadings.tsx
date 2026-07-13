import { useEffect, useState } from "react";
import { Card, CardContent } from "../../../ui/card";
import { Skeleton } from "../../../ui/skeleton";

function readingSkeletonCountForViewport(): number {
  if (typeof window === "undefined") return 6;
  if (window.matchMedia("(min-width: 1280px)").matches) return 10;
  if (window.matchMedia("(min-width: 1024px)").matches) return 8;
  if (window.matchMedia("(min-width: 768px)").matches) return 6;
  if (window.matchMedia("(min-width: 640px)").matches) return 4;
  return 3;
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
    ].map((query) => window.matchMedia(query));
    queries.forEach((mediaQuery) =>
      mediaQuery.addEventListener("change", update),
    );
    update();
    return () =>
      queries.forEach((mediaQuery) =>
        mediaQuery.removeEventListener("change", update),
      );
  }, []);

  return count;
}

const SkeletonMyReadings = () => {
  const count = useReadingSkeletonCount();

  return (
    <div
      className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      role="status"
      aria-label="Carregando leituras"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="flex w-full flex-row items-stretch gap-0 overflow-hidden py-0 md:flex-col"
        >
          <div className="relative w-22 shrink-0 self-stretch overflow-hidden bg-muted sm:w-28 md:aspect-2/3 md:w-full md:shrink">
            <Skeleton className="h-full w-full rounded-none" />
          </div>

          <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col justify-between p-3 sm:p-4">
            <div>
              <div className="mb-2 flex items-start justify-between gap-2">
                <Skeleton className="h-5 max-w-[70%] flex-1" />
                <Skeleton className="hidden h-5 w-16 shrink-0 md:block" />
              </div>
              <Skeleton className="mb-2 h-4 w-2/3 max-w-40" />
              <Skeleton className="mb-3 h-5 w-16 md:hidden" />
              <Skeleton className="mb-3 h-4 w-full" />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex origin-left scale-90 items-center gap-1 md:scale-100">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Skeleton
                      key={starIndex}
                      className="h-5 w-5 shrink-0 rounded-full sm:h-6 sm:w-6"
                    />
                  ))}
                </div>
                <Skeleton className="h-4 w-8 shrink-0" />
              </div>
              <div className="flex justify-end gap-1.5 border-t border-border/60 pt-3">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SkeletonMyReadings;
