import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import { Badge } from "./ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";

export default function HeaderClubSwitcher() {
  const { user } = useAuth();
  const { selectedClubId, setSelectedClubId, clubs, isLoadingClubs } =
    useClub();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const selectedClub = clubs.find((club) => club.id === selectedClubId);
  const canSwitch = clubs.length > 1;

  if (isLoadingClubs || !selectedClub) {
    return null;
  }

  const handleSelect = (clubId: string) => {
    setSelectedClubId(clubId);
    queryClient.invalidateQueries({
      queryKey: ["booksFromSelectedClub", clubId],
    });
    setOpen(false);
  };

  const clubName = (
    <span className="truncate max-w-32 sm:max-w-48 md:max-w-[16rem] text-lg font-semibold text-foreground">
      {selectedClub.name}
    </span>
  );

  if (!canSwitch) {
    return clubName;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex min-w-0 items-center gap-1 rounded-md px-1 py-0.5 transition-colors hover:bg-secondary/60 cursor-pointer"
        >
          {clubName}
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2">
        <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Trocar de clube
        </p>
        <ul className="flex flex-col gap-0.5">
          {clubs.map((club) => {
            const isSelected = club.id === selectedClubId;
            const isAdmin = user?.id === club.ownerId;

            return (
              <li key={club.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(club.id)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-secondary/60",
                    isSelected && "bg-secondary/40",
                  )}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isSelected ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex-1 truncate font-medium">
                    {club.name}
                  </span>
                  {isAdmin && (
                    <Badge variant="secondary" className="shrink-0">
                      Admin
                    </Badge>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
