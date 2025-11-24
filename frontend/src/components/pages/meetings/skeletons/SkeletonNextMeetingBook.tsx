import { Card, CardContent } from "../../../ui/card";
import { Skeleton } from "../../../ui/skeleton";

const SkeletonNextMeetingBook = () => {
  return (
    <div className="hidden md:block max-w-md h-full">
      <Skeleton className="h-10 w-3/4 rounded-2xl mb-4" />
      <Card className="group py-0 gap-0 max-w-sm mx-auto md:max-w-none md:mx-0">
        <div className="relative aspect-2/3 overflow-hidden">
          <Skeleton className="w-full h-full object-cover transition-transform group-hover:scale-105" />
          <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-30 transition-opacity" />
        </div>
        <CardContent className="py-10">
          <div className="flex items-start justify-between">
            <Skeleton className="h-10 w-5/6 rounded-md mb-2" />
          </div>
          <Skeleton className="h-6 w-4/6 rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
};

export default SkeletonNextMeetingBook;
