import { Card, CardHeader, CardContent, CardFooter } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

const SkeletonHome = () => {
  return (
    <div className="flex flex-col w-full max-w-7xl p-5 md:p-20">
      <div id="boas-vindas" className="flex flex-col items-start">
        <Skeleton className="h-12 w-2/9 mb-4" />
        <Skeleton className="h-8 w-1/3 mb-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-10 mt-5">
        <Card className="w-full gap-1">
          <CardHeader>
            <Skeleton className="h-8 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-5 w-6/7" />
          </CardContent>
          <CardFooter>
            <Skeleton className="mt-5 py-6 w-full rounded-xl" />
          </CardFooter>
        </Card>
        <Card className="w-full gap-1">
          <CardHeader>
            <Skeleton className="h-8 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-5 w-6/7" />
          </CardContent>
          <CardFooter className="mt-6 grid grid-cols-3">
            <Skeleton className="col-span-2 p-3 mr-2 py-6 rounded-xl" />
            <Skeleton className="col-span-1 py-6 rounded-xl" />
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-10 mt-5">
        <Card id="card-meus-clubes" className="w-full mt-3 gap-2">
          <CardHeader>
            <Skeleton className="h-10 w-1/7" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Card className="w-full gap-0 ">
              <CardHeader className="pb-2">
                <div className="flex">
                  <Skeleton className="h-5 w-30 rounded-2xl" />
                  <Skeleton className="h-5 w-20 rounded-2xl ml-2" />
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-2">
                <Skeleton className="h-5 w-6/8" />
              </CardContent>

              <CardFooter className="flex justify-between">
                <Skeleton className="h-5 w-40 rounded-2xl" />
                <Skeleton className="h-5 w-20 rounded-2xl" />
              </CardFooter>
            </Card>
          </CardContent>
          <CardContent className="flex flex-col gap-4 mt-2">
            <Card className="w-full gap-0 ">
              <CardHeader className="pb-2">
                <div className="flex">
                  <Skeleton className="h-5 w-30 rounded-2xl" />
                  <Skeleton className="h-5 w-20 rounded-2xl ml-2" />
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-2">
                <Skeleton className="h-5 w-6/8" />
              </CardContent>

              <CardFooter className="flex justify-between">
                <Skeleton className="h-5 w-40 rounded-2xl" />
                <Skeleton className="h-5 w-20 rounded-2xl" />
              </CardFooter>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default SkeletonHome;
