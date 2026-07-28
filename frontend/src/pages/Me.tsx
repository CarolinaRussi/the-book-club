import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import MyProfileHero from "@/components/pages/me/MyProfileHero";
import ProfileReadingsGrid from "@/components/pages/profile/ProfileReadingsGrid";
import ProfileSectionHeading from "@/components/pages/profile/ProfileSectionHeading";

export default function Me() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "settings") {
      navigate("/me/account", { replace: true });
      return;
    }
    if (tab) {
      navigate("/me", { replace: true });
    }
  }, [searchParams, navigate]);

  if (!user) return null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-5 md:px-8 md:py-12">
      <MyProfileHero />

      <section className="space-y-6">
        <ProfileSectionHeading
          id="livros"
          title="Minha estante"
          description="O que você finalizou e o que outros leitores verão no seu perfil."
        />
        <ProfileReadingsGrid userId={user.id} />
      </section>
    </div>
  );
}
