import { Card, CardContent } from "../../../ui/card";
import { Skeleton } from "../../../ui/skeleton";

const SkeletonNextMeetingList = () => {
  return (
    <Card className="shadow-(--shadow-soft)">
      <CardContent className=" px-8 relative">
        <div className="flex items-start gap-3 pb-2">
          <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
          <div>
            <Skeleton className="h-4 w-25 rounded-2xl mb-2" />
            <Skeleton className="h-4 w-20 rounded-2xl mb-2" />
          </div>
        </div>

        <div className="flex items-start gap-3 pb-2">
          <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
          <div>
            <Skeleton className="h-4 w-25 rounded-2xl mb-2" />
            <Skeleton className="h-4 w-20 rounded-2xl mb-2" />
          </div>
        </div>
        <div className="md:hidden flex items-start gap-3 pb-4">
          <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
          <div>
            <Skeleton className="h-4 w-25 rounded-2xl mb-2" />
            <Skeleton className="h-4 w-20 rounded-2xl mb-2" />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 md:flex-row md:absolute md:right-6 md:top-0 md:mt-0">
          <Skeleton className="h-8 w-full md:w-20" />
          <Skeleton className="h-8 w-full md:w-40" />
        </div>
      </CardContent>
    </Card>
  );
};

export default SkeletonNextMeetingList;
