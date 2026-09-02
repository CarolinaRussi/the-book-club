import LandingFeatures from "@/components/pages/landing/LandingFeatures";
import LandingFinalCta from "@/components/pages/landing/LandingFinalCta";
import LandingHero from "@/components/pages/landing/LandingHero";
import LandingHowItWorks from "@/components/pages/landing/LandingHowItWorks";
import LandingProblem from "@/components/pages/landing/LandingProblem";

export default function Index() {
  return (
    <div className="landing-page-paper relative flex w-full flex-col pb-6">
      <div
        aria-hidden
        className="landing-page-paper-texture pointer-events-none absolute inset-0"
      />
      <div className="relative z-10 flex w-full flex-col">
        <LandingHero />
        <div className="mx-auto w-full max-w-6xl">
          <LandingProblem />
          <LandingHowItWorks />
          <LandingFeatures />
          <LandingFinalCta />
        </div>
      </div>
    </div>
  );
}
