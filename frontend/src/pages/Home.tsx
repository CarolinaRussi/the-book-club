import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import HomeOnboardingCards from "@/components/pages/home/HomeOnboardingCards";
import HomeUpcomingMeetings from "@/components/pages/home/HomeUpcomingMeetings";
import HomeSidebar from "@/components/pages/home/HomeSidebar";
import StickySidebarColumn from "@/components/pages/home/StickySidebarColumn";
import FeedSection from "@/components/pages/home/FeedSection";
import HomeEmptyState from "@/components/pages/home/HomeEmptyState";
import PendingMeetingRecapPrompt from "@/components/pages/home/PendingMeetingRecapPrompt";
import { TbBooks } from "react-icons/tb";

export default function Home() {
  const { user } = useAuth();
  const { clubs } = useClub();
  const hasClubs = clubs.length > 0;

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto p-5 md:p-12 lg:p-15">
      {hasClubs ? <PendingMeetingRecapPrompt /> : null}

      <div id="boas-vindas" className="flex flex-col items-start">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground">
          Olá, {user?.nickname || "Bem-vindo de volta"}
        </h1>
        <p className="text-lg md:text-2xl mt-3 w-full text-muted-foreground">
          {hasClubs
            ? "Atualizações dos seus clubes"
            : "O que você gostaria de fazer hoje?"}
        </p>
      </div>

      {!hasClubs ? (
        <>
          <HomeOnboardingCards variant="onboarding" />
          <HomeEmptyState
            icon={<TbBooks className="h-8 w-8" />}
            message="Você ainda não faz parte de nenhum clube. Crie um ou use um código de convite!"
            className="mt-6"
          />
        </>
      ) : (
        <>
          <HomeOnboardingCards variant="compact" className="mt-5 md:hidden" />
          <div
            className="my-5 h-px w-full bg-foreground/15 md:hidden"
            aria-hidden
          />
          <HomeUpcomingMeetings maxItems={3} className="md:hidden" />

          <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-8">
            <FeedSection />
            <StickySidebarColumn className="hidden md:block">
              <HomeSidebar />
            </StickySidebarColumn>
          </div>
        </>
      )}
    </div>
  );
}
