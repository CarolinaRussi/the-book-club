import { cn } from "@/lib/utils";
import HomeInviteCard from "./HomeInviteCard";
import HomeOnboardingCards from "./HomeOnboardingCards";
import HomeUpcomingMeetings from "./HomeUpcomingMeetings";

type HomeSidebarProps = {
  className?: string;
};

export default function HomeSidebar({ className }: HomeSidebarProps) {
  return (
    <aside className={cn("flex flex-col gap-4", className)}>
      <HomeInviteCard />
      <HomeOnboardingCards variant="sidebar" />
      <HomeUpcomingMeetings maxItems={5} />
    </aside>
  );
}
