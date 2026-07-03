import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/utils/formatters";

export interface ProfileHeroProps {
  name?: string;
  nickname?: string;
  bio?: string;
  profilePicture?: string;
  favoritesGenres?: string[];
  actionsSlot?: ReactNode;
  avatarSlot?: ReactNode;
  nameSlot?: ReactNode;
  nicknameSlot?: ReactNode;
  bioSlot?: ReactNode;
  genresSlot?: ReactNode;
}

export default function ProfileHero({
  name,
  nickname,
  bio,
  profilePicture,
  favoritesGenres = [],
  actionsSlot,
  avatarSlot,
  nameSlot,
  nicknameSlot,
  bioSlot,
  genresSlot,
}: ProfileHeroProps) {
  return (
    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
      {actionsSlot ? (
        <div className="absolute right-0 top-0 sm:relative sm:order-last sm:ml-auto">
          {actionsSlot}
        </div>
      ) : null}

      {avatarSlot ?? (
        <Avatar className="size-28 shrink-0 sm:size-32 md:size-36">
          <AvatarImage src={profilePicture || undefined} alt={name || "Perfil"} />
          <AvatarFallback className="text-3xl text-primary" delayMs={600}>
            {getInitials(name || "")}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="min-w-0 flex-1 space-y-3 pr-10 sm:pr-0">
        <div className="space-y-0.5">
          {nicknameSlot ??
            (nickname ? (
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {nickname}
              </h1>
            ) : null)}
          {nameSlot ??
            (name ? (
              <p className="text-base text-muted-foreground sm:text-lg">{name}</p>
            ) : null)}
        </div>

        {bioSlot ??
          (bio ? (
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {bio}
            </p>
          ) : null)}

        {genresSlot ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Gêneros preferidos:
            </p>
            {genresSlot}
          </div>
        ) : favoritesGenres.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Gêneros preferidos:
            </p>
            <div className="flex flex-wrap gap-2">
              {favoritesGenres.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
