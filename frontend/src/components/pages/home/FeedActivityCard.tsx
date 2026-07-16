import type { IFeedActivity } from "@/types/IFeed";
import { FinishedFeedCard } from "./FinishedFeedCard";
import { MeetingRecapFeedCard } from "./MeetingRecapFeedCard";

type FeedActivityCardProps = {
  activity: IFeedActivity;
};

export default function FeedActivityCard({ activity }: FeedActivityCardProps) {
  if (activity.type === "meeting_recap") {
    return <MeetingRecapFeedCard activity={activity} />;
  }
  return <FinishedFeedCard activity={activity} />;
}
