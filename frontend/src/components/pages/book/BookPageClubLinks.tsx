import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown } from "lucide-react";
import { useClub } from "@/contexts/ClubContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { IBookPageClub } from "@/types/IBooks";

type BookPageClubLinksProps = {
  clubs: IBookPageClub[];
};

function ClubNameLink({
  club,
  onSelect,
}: {
  club: IBookPageClub;
  onSelect: (clubId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(club.id)}
      className="cursor-pointer font-medium text-primary underline-offset-2 hover:underline"
    >
      {club.name}
    </button>
  );
}

export function BookPageClubLinks({ clubs }: BookPageClubLinksProps) {
  const navigate = useNavigate();
  const { setSelectedClubId } = useClub();
  const [popoverOpen, setPopoverOpen] = useState(false);

  if (clubs.length === 0) return null;

  const goToClubLibrary = (clubId: string) => {
    setSelectedClubId(clubId);
    setPopoverOpen(false);
    navigate("/library");
  };

  if (clubs.length === 1) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        No clube <ClubNameLink club={clubs[0]} onSelect={goToClubLibrary} />
      </p>
    );
  }

  if (clubs.length === 2) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        Nos clubes{" "}
        <ClubNameLink club={clubs[0]} onSelect={goToClubLibrary} />
        {" e "}
        <ClubNameLink club={clubs[1]} onSelect={goToClubLibrary} />
      </p>
    );
  }

  const [firstClub, ...otherClubs] = clubs;

  return (
    <p className="mt-2 text-sm text-muted-foreground">
      No clube <ClubNameLink club={firstClub} onSelect={goToClubLibrary} />
      {" e "}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-0.5 font-medium text-primary underline-offset-2 hover:underline"
          >
            mais {otherClubs.length} clubes seus
            <ChevronDown className="size-3.5 shrink-0 opacity-70" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-2">
          <p className="mb-2 px-2 text-xs text-muted-foreground">
            Ir à biblioteca do clube
          </p>
          <ul className="flex flex-col gap-0.5">
            {otherClubs.map((clubRow) => (
              <li key={clubRow.id}>
                <button
                  type="button"
                  onClick={() => goToClubLibrary(clubRow.id)}
                  className="w-full cursor-pointer rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
                >
                  {clubRow.name}
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </p>
  );
}
