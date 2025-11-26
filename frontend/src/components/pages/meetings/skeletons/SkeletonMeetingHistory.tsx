import { Card, CardContent } from "../../../ui/card";
import { Skeleton } from "../../../ui/skeleton";

const SkeletonMeetingHistory = () => {
  return (
    <div className="rounded-2xl p-2">
      <h2 className="text-2xl font-bold mb-4">Histórico de Encontros</h2>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="shadow-(--shadow-soft) py-3">
            <CardContent className="flex justify-between px-4">
              <div>
                <div className="flex gap-3 mb-2">
                  <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
                  <div>
                    <Skeleton className="h-5 w-20 mb-2" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                </div>
                <div className="flex items-start gap-3 ">
                  <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
                  <div>
                    <Skeleton className="h-5 w-20 mb-2" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between items-end">
                <div className="">
                  <Skeleton className="h-5 w-20 place-self-end mb-2" />
                  <Skeleton className="h-5 w-30 place-self-end" />
                </div>
                <Skeleton className="h-5 w-30" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SkeletonMeetingHistory;
