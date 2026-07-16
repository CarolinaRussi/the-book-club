import { Button } from "@/components/ui/button";
import type { IMeeting } from "@/types/IMeetings";
import MeetingRecapForm, {
  emptyMeetingRecapFormValue,
  type MeetingRecapFormValue,
} from "./MeetingRecapForm";

type CompletedMeetingRecapSectionProps = {
  meeting: IMeeting;
  recapExpanded: boolean;
  recapForm: MeetingRecapFormValue;
  disabled: boolean;
  onRecapFormChange: (value: MeetingRecapFormValue) => void;
  onExpand: () => void;
  onCollapse: () => void;
  onDelete: () => void;
};

export function CompletedMeetingRecapSection({
  meeting,
  recapExpanded,
  recapForm,
  disabled,
  onRecapFormChange,
  onExpand,
  onCollapse,
  onDelete,
}: CompletedMeetingRecapSectionProps) {
  return (
    <div className="mt-2 border-t border-secondary/50 pt-4">
      <h3 className="mb-3 text-xl font-semibold">Memória do encontro</h3>
      {meeting.recap || recapExpanded ? (
        <div className="flex flex-col gap-3">
          <MeetingRecapForm
            value={recapForm}
            onChange={onRecapFormChange}
            disabled={disabled}
            idPrefix="completed-recap"
          />
          {meeting.recap ? (
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={onDelete}
              className="w-full self-start sm:w-auto"
            >
              Apagar registro
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              onClick={() => {
                onCollapse();
                onRecapFormChange(emptyMeetingRecapFormValue());
              }}
              className="w-full self-start sm:w-auto"
            >
              Fechar registro
            </Button>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="secondary"
          onClick={onExpand}
          className="w-full sm:w-auto"
        >
          Registrar encontro
        </Button>
      )}
    </div>
  );
}
