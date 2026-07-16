import { Link } from "react-router";
import type { IDiscoverClub } from "@/types/IClubs";
import {
  clubJoinPolicyLabels,
  meetingFormatLabels,
} from "@/utils/constants/clubs";

type DiscoverClubCardProps = {
  club: IDiscoverClub;
};

export function DiscoverClubCard({ club }: DiscoverClubCardProps) {
  const locationLabel =
    club.city && club.state
      ? `${club.city.name}, ${club.state.code}`
      : "Local não informado";

  const formatLabel = club.meetingFormat
    ? meetingFormatLabels[club.meetingFormat]
    : "Formato não informado";

  const memberLabel = `${club.memberCount} ${
    club.memberCount === 1 ? "membro" : "membros"
  }`;

  const metaItems = [
    formatLabel,
    locationLabel,
    memberLabel,
    clubJoinPolicyLabels[club.joinPolicy],
  ];

  return (
    <Link
      to={`/explorar/${club.id}`}
      className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-secondary/10"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">{club.name}</h2>
        {club.isMember ? (
          <span className="shrink-0 rounded-md bg-secondary/40 px-2 py-0.5 text-xs font-medium text-foreground">
            Seu clube
          </span>
        ) : null}
      </div>
      <p className="line-clamp-3 text-sm text-muted-foreground">
        {club.description}
      </p>
      <p className="mt-auto text-xs text-muted-foreground">
        {metaItems.map((item, index) => (
          <span key={item}>
            {index > 0 ? (
              <span className="mx-1.5 text-muted-foreground/70" aria-hidden>
                ·
              </span>
            ) : null}
            {item}
          </span>
        ))}
      </p>
    </Link>
  );
}
