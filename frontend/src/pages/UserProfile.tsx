import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserProfile } from "@/api/queries/fetchUserProfile";
import ProfileHero from "@/components/pages/profile/ProfileHero";
import ProfileReadingsGrid from "@/components/pages/profile/ProfileReadingsGrid";
import ProfileSectionHeading from "@/components/pages/profile/ProfileSectionHeading";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: viewer } = useAuth();

  useEffect(() => {
    if (viewer?.id && userId && viewer.id === userId) {
      navigate("/me", { replace: true });
    }
  }, [viewer?.id, userId, navigate]);

  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userProfile", viewer?.id, userId],
    queryFn: () => fetchUserProfile(userId!),
    enabled: !!viewer && !!userId && viewer.id !== userId,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  if (!viewer || !userId || viewer.id === userId) {
    return null;
  }

  const errorMessage = axios.isAxiosError(error)
    ? (error.response?.data as { message?: string })?.message
    : undefined;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-5 md:px-8 md:py-12">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      {isLoading ? (
        <div className="space-y-6">
          <div className="flex gap-6">
            <Skeleton className="size-28 shrink-0 rounded-full sm:size-32" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-16 w-full max-w-xl" />
            </div>
          </div>
        </div>
      ) : isError ? (
        <p className="py-12 text-center text-muted-foreground">
          {errorMessage ?? "Não foi possível carregar este perfil."}
        </p>
      ) : profile ? (
        <>
          <ProfileHero
            name={profile.user.name}
            nickname={profile.user.nickname}
            bio={profile.user.bio ?? undefined}
            profilePicture={profile.user.profilePicture ?? undefined}
            favoritesGenres={profile.user.favoritesGenres}
          />

          <section className="space-y-6">
            <ProfileSectionHeading
              title="Minha estante"
              description={
                profile.stats.finishedBooksCount > 0
                  ? `${profile.stats.finishedBooksCount} livro${
                      profile.stats.finishedBooksCount === 1 ? "" : "s"
                    } finalizado${profile.stats.finishedBooksCount === 1 ? "" : "s"}.`
                  : undefined
              }
            />
            <ProfileReadingsGrid
              userId={userId}
              variant="public"
              viewerId={viewer.id}
              showClubBadges={false}
              emptyMessage="Nenhum livro finalizado ainda."
            />
          </section>
        </>
      ) : null}
    </div>
  );
}
