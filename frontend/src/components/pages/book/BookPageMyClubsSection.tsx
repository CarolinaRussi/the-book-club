import { LuCalendarDays } from "react-icons/lu";
import type { IBookPageClub } from "@/types/IBooks";
import { getBookStatusBadgeLabel } from "@/utils/constants/books";
import { formatMonthYear } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type BookPageMyClubsSectionProps = {
  clubs: IBookPageClub[];
};

export function BookPageMyClubsSection({ clubs }: BookPageMyClubsSectionProps) {
  if (clubs.length === 0) {
    return (
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-primary">Seus clubes</h2>
        <p className="text-sm text-muted-foreground">
          Este livro ainda não aparece em nenhum dos seus clubes.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold text-primary">Seus clubes</h2>
      <ul className="flex flex-col gap-3">
        {clubs.map((clubRow) => (
          <li key={clubRow.id}>
            <Card className="bg-cream">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-semibold text-primary">{clubRow.name}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <LuCalendarDays size={16} />
                    <span>Adicionado em {formatMonthYear(clubRow.addedAt)}</span>
                  </div>
                </div>
                <Badge className="shrink-0">
                  {getBookStatusBadgeLabel(clubRow.clubBookStatus)}
                </Badge>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
