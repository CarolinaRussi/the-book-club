import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import HomeOnboardingCards from "@/components/pages/home/HomeOnboardingCards";
import HomeUpcomingMeetings from "@/components/pages/home/HomeUpcomingMeetings";
import HomeSidebar from "@/components/pages/home/HomeSidebar";
import FeedSection from "@/components/pages/home/FeedSection";
import HomeEmptyState from "@/components/pages/home/HomeEmptyState";
import { TbBooks } from "react-icons/tb";

export default function Home() {
  const { user } = useAuth();
  const { clubs } = useClub();
  const hasClubs = clubs.length > 0;

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto p-5 md:p-12 lg:p-20">
      <div id="boas-vindas" className="flex flex-col items-start">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground">
          Olá, {user?.nickname || "Bem-vindo ao Clube do Livro"}
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
          <HomeUpcomingMeetings
            maxItems={3}
            className="mt-6 md:hidden"
          />

          <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-8 items-start">
            <FeedSection />
            <HomeSidebar className="hidden md:flex sticky top-6" />
          </div>

          <HomeOnboardingCards
            variant="compact"
            className="mt-8 md:hidden"
          />
        </>
      )}
    </div>
  );
}
