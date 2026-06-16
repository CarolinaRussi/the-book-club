import { cn } from "@/lib/utils";
import HomeOnboardingCards from "./HomeOnboardingCards";
import HomeUpcomingMeetings from "./HomeUpcomingMeetings";

type HomeSidebarProps = {
  className?: string;
};

export default function HomeSidebar({ className }: HomeSidebarProps) {
  return (
    <aside className={cn("flex flex-col gap-4", className)}>
      <HomeOnboardingCards variant="sidebar" />
      <HomeUpcomingMeetings maxItems={5} />
    </aside>
  );
}
