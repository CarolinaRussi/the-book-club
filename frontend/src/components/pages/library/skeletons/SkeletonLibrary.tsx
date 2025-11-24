import { Card, CardContent } from "../../../ui/card";
import { Skeleton } from "../../../ui/skeleton";

const SkeletonLibrary = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
      {Array.from({ length: 4 }).map((_) => (
        <Card className="cursor-pointer hover:shadow-(--shadow-medium) transition-all overflow-hidden group py-0 gap-0 max-w-sm mx-auto md:max-w-none md:mx-0">
          <div className="relative aspect-2/3 overflow-hidden bg-muted">
            <Skeleton className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-30 transition-opacity" />
          </div>

          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <Skeleton className="w-30 h-5" />
              <Skeleton className="ml-2 h-5 w-20 mb-10" />
            </div>
            <Skeleton className="w-25 h-5 mb-3" />

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_) => (
                  <Skeleton className="h-6 w-6 rounded-2xl" />
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
