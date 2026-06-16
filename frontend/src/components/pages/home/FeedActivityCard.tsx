import { Link } from "react-router";
import { Rating } from "react-simple-star-rating";
import type { IFeedActivity } from "@/types/IFeed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { formatRelativeTime, getInitials } from "@/utils/formatters";

type FeedActivityCardProps = {
  activity: IFeedActivity;
};

export default function FeedActivityCard({ activity }: FeedActivityCardProps) {
  const { actor, book, isOwnActivity, rating, comment, updatedAt } = activity;
  const displayName = actor.nickname || actor.name;

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={actor.profilePicture ?? undefined} alt={actor.name} />
          <AvatarFallback>{getInitials(actor.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground">{displayName}</span>
            {isOwnActivity && (
              <Badge variant="secondary" className="text-xs">
                Você
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              · {formatRelativeTime(updatedAt)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isOwnActivity ? "Você finalizou" : "Finalizou"}{" "}
            <span className="font-medium text-foreground">{book.title}</span>
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex gap-4 pt-0">
        {book.coverUrl && (
          <img
            src={book.coverUrl}
            alt=""
            className="h-24 w-16 shrink-0 rounded-md object-cover bg-muted"
          />
        )}
        <div className="min-w-0 flex-1 space-y-2">
          {book.author && (
            <p className="text-sm text-muted-foreground">{book.author}</p>
          )}
          {rating != null && (
            <div className="flex items-center gap-2">
              <Rating
                initialValue={rating}
                readonly
                allowFraction
                SVGstyle={{ display: "inline" }}
                size={18}
                fillColor="#be2c3f"
                emptyColor="#e2cad0"
              />
              <span className="text-sm font-semibold tabular-nums">
                {rating.toFixed(1)}
              </span>
            </div>
          )}
          {comment && (
            <p className="text-sm text-foreground line-clamp-3">{comment}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="link" className="h-auto p-0" asChild>
          <Link to="/library">Ver na biblioteca</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
