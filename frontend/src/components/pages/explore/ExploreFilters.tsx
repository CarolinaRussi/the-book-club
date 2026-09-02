import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CitySelect } from "@/components/pages/club/CitySelect";
import type { IState } from "@/types/IClubs";
import {
  MEETING_FORMAT_VALUES,
  meetingFormatLabels,
  type MeetingFormat,
} from "@/utils/constants/clubs";

const ALL_VALUE = "all";

export type ExploreFiltersState = {
  searchInput: string;
  meetingFormat: MeetingFormat | "";
  stateId: number | null;
  cityId: number | null;
};

type ExploreFiltersProps = {
  filters: ExploreFiltersState;
  states: IState[];
  onSearchInputChange: (value: string) => void;
  onApplySearch: () => void;
  onMeetingFormatChange: (value: MeetingFormat | "") => void;
  onStateIdChange: (value: number | null) => void;
  onCityIdChange: (value: number | null) => void;
};

export function ExploreFilters({
  filters,
  states,
  onSearchInputChange,
  onApplySearch,
  onMeetingFormatChange,
  onStateIdChange,
  onCityIdChange,
}: ExploreFiltersProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4">
      <div className="lg:col-span-2">
        <label className="mb-1 block text-sm font-medium">Busca</label>
        <div className="flex gap-2">
          <Input
            value={filters.searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onApplySearch();
              }
            }}
            placeholder="Nome ou descrição"
          />
          <Button type="button" variant="outline" onClick={onApplySearch}>
            Buscar
          </Button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Formato</label>
        <Select
          value={filters.meetingFormat || ALL_VALUE}
          onValueChange={(value) =>
            onMeetingFormatChange(
              value === ALL_VALUE ? "" : (value as MeetingFormat),
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Todos</SelectItem>
            {MEETING_FORMAT_VALUES.map((format) => (
              <SelectItem key={format} value={format}>
                {meetingFormatLabels[format]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Ir para o estado</label>
        <Select
          value={
            filters.stateId != null ? String(filters.stateId) : ALL_VALUE
          }
          onValueChange={(value) =>
            onStateIdChange(value === ALL_VALUE ? null : Number(value))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Brasil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Brasil</SelectItem>
            {states.map((stateRow) => (
              <SelectItem key={stateRow.id} value={String(stateRow.id)}>
                {stateRow.code} — {stateRow.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-2 lg:col-span-4">
        <label className="mb-1 block text-sm font-medium">Ir para a cidade</label>
        <CitySelect
          stateId={filters.stateId}
          value={filters.cityId}
          onChange={onCityIdChange}
          allowClear
        />
      </div>
    </div>
  );
}
