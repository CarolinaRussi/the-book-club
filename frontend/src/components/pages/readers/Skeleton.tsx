import { Skeleton } from "../../ui/skeleton";

const SkeletonReaders = () => {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="flex flex-col items-center border border-secondary rounded-lg p-8 bg-background shadow-md">
            <Skeleton className="h-30 w-30 rounded-full mb-4" />
            <Skeleton className="h-10 w-[120px] rounded-2xl mb-3" />
            <Skeleton className="h-5 w-[150px] rounded-2xl mb-3" />
          </div>
          <div className="flex flex-col items-center border border-secondary rounded-lg p-8 bg-background shadow-md">
            <Skeleton className="h-30 w-30 rounded-full mb-4" />
            <Skeleton className="h-10 w-[120px] rounded-2xl mb-3" />
            <Skeleton className="h-5 w-[150px] rounded-2xl mb-3" />
          </div>
        </div>
  );
};

export default SkeletonReaders;