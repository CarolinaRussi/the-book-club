import { Card, CardContent } from "../../../ui/card";
import { Skeleton } from "../../../ui/skeleton";

const SkeletonLibrary = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-10">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card
          key={index}
          className="flex w-full flex-row items-stretch overflow-hidden cursor-pointer hover:shadow-(--shadow-medium) transition-all group py-0 gap-0 md:flex-col"
        >
          <div className="relative w-[5.5rem] shrink-0 self-stretch overflow-hidden bg-muted sm:w-28 md:w-full md:aspect-2/3 md:shrink md:rounded-t-xl">
            <Skeleton className="h-full w-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-30 transition-opacity" />
          </div>

          <CardContent className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
            <div className="mb-2 flex items-start gap-2">
              <Skeleton className="h-5 min-h-10 flex-1 sm:min-h-12" />
              <Skeleton className="hidden h-5 w-16 shrink-0 md:block" />
            </div>
            <Skeleton className="mb-2 w-3/4 h-5 md:mb-3" />
            <Skeleton className="mb-3 h-5 w-20 md:hidden" />

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-6 w-6 rounded-2xl" />
                ))}
              </div>
              <Skeleton className="h-5 w-10" />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-25" />
              </div>
              <span>
                <Skeleton className="h-4 w-20" />
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SkeletonLibrary;
