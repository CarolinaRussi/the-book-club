import LandingFeatures from "@/components/pages/landing/LandingFeatures";
import LandingFinalCta from "@/components/pages/landing/LandingFinalCta";
import LandingHero from "@/components/pages/landing/LandingHero";
import LandingHowItWorks from "@/components/pages/landing/LandingHowItWorks";
import LandingProblem from "@/components/pages/landing/LandingProblem";

export default function Index() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col pb-6">
      <LandingHero />
      <LandingProblem />
      <LandingHowItWorks />
      <LandingFeatures />
      <LandingFinalCta />
    </div>
  );
}
