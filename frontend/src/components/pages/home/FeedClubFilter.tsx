import { useState } from "react";
import { Check, ChevronDown, ListFilter } from "lucide-react";
import type { IClub } from "@/types/IClubs";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type FeedClubFilterProps = {
  clubs: IClub[];
  selectedClubIds: string[];
  onChange: (clubIds: string[]) => void;
};

export default function FeedClubFilter({
  clubs,
  selectedClubIds,
  onChange,
}: FeedClubFilterProps) {
  const [open, setOpen] = useState(false);
  const isAllSelected = selectedClubIds.length === 0;

  const triggerLabel = (() => {
    if (isAllSelected) return "Todos os clubes";
    if (selectedClubIds.length === 1) {
      return (
        clubs.find((club) => club.id === selectedClubIds[0])?.name ??
        "1 clube"
      );
    }
    return `${selectedClubIds.length} clubes`;
  })();

  const handleToggleClub = (clubId: string) => {
    if (isAllSelected) {
      onChange([clubId]);
      return;
    }

    const isSelected = selectedClubIds.includes(clubId);
    if (isSelected) {
      const nextIds = selectedClubIds.filter((id) => id !== clubId);
      onChange(nextIds);
      return;
    }

    onChange([...selectedClubIds, clubId]);
  };

  const handleSelectAll = () => {
    onChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit max-w-full gap-1.5 rounded-xl"
        >
          <ListFilter className="h-4 w-4 shrink-0" />
          <span className="truncate">{triggerLabel}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2">
        <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Filtrar por clube
        </p>
        <ul className="flex flex-col gap-0.5">
          <li>
            <button
              type="button"
              onClick={handleSelectAll}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-secondary/60",
                isAllSelected && "bg-secondary/40",
              )}
            >
              <Check
                className={cn(
                  "h-4 w-4 shrink-0",
                  isAllSelected ? "opacity-100" : "opacity-0",
                )}
              />
              <span className="flex-1 truncate font-medium">
                Todos os clubes
              </span>
            </button>
          </li>
          {clubs.map((club) => {
            const isChecked =
              !isAllSelected && selectedClubIds.includes(club.id);

            return (
              <li key={club.id}>
                <button
                  type="button"
                  onClick={() => handleToggleClub(club.id)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-secondary/60",
                    isChecked && "bg-secondary/40",
                  )}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isChecked ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex-1 truncate font-medium">
                    {club.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
