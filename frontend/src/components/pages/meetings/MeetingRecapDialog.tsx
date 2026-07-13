import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IApiError } from "@/types/IApi";
import type { IMeeting } from "@/types/IMeetings";
import { formatDayMonthYear } from "@/utils/formatters";
import {
  createMeetingRecap,
  dismissMeetingRecapPrompt,
  updateMeetingRecap,
} from "@/api/mutations/meetingRecapMutate";
import MeetingRecapForm, {
  emptyMeetingRecapFormValue,
  meetingRecapHasContent,
  type MeetingRecapFormValue,
} from "./MeetingRecapForm";

interface MeetingRecapDialogProps {
  openDialog: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: Pick<
    IMeeting,
    "id" | "meetingDate" | "book" | "recap"
  > | null;
  showDismissButton?: boolean;
  onFinished?: () => void;
}

const MeetingRecapDialog = ({
  openDialog,
  onOpenChange,
  meeting,
  showDismissButton = false,
  onFinished,
}: MeetingRecapDialogProps) => {
  const queryClient = useQueryClient();
  const [recapForm, setRecapForm] = useState<MeetingRecapFormValue>(
    emptyMeetingRecapFormValue(),
  );

  useEffect(() => {
    if (openDialog && meeting) {
      setRecapForm(emptyMeetingRecapFormValue(meeting.recap));
    }
  }, [openDialog, meeting]);

  const invalidateRecapQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ["pastMeetings"] });
    await queryClient.invalidateQueries({ queryKey: ["myFeed"] });
    await queryClient.invalidateQueries({
      queryKey: ["pendingMeetingRecap"],
    });
  };

  const { mutate: saveRecap, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      if (!meeting) {
        throw { message: "Encontro não encontrado." };
      }
      if (!meetingRecapHasContent(recapForm)) {
        throw {
          message: "Informe um texto ou uma foto para o registro do encontro.",
        };
      }

      if (meeting.recap) {
        return updateMeetingRecap({
          meetingId: meeting.id,
          text: recapForm.text,
          image: recapForm.imageFile,
          removeImage: recapForm.removeImage,
        });
      }

      return createMeetingRecap({
        meetingId: meeting.id,
        text: recapForm.text,
        image: recapForm.imageFile,
      });
    },
    onSuccess: async () => {
      await invalidateRecapQueries();
      onOpenChange(false);
      onFinished?.();
      toast.success(
        meeting?.recap
          ? "Registro do encontro atualizado."
          : "Registro do encontro publicado.",
      );
    },
    onError: (error: IApiError) => {
      toast.error(error.message || "Erro ao salvar registro do encontro.");
    },
  });

  const { mutate: dismissPrompt, isPending: isDismissing } = useMutation({
    mutationFn: async () => {
      if (!meeting) {
        throw { message: "Encontro não encontrado." };
      }
      return dismissMeetingRecapPrompt(meeting.id);
    },
    onSuccess: async () => {
      await invalidateRecapQueries();
      onOpenChange(false);
      onFinished?.();
    },
    onError: (error: IApiError) => {
      toast.error(error.message || "Erro ao dispensar lembrete.");
    },
  });

  const bookTitle = meeting?.book?.title;

  return (
    <Dialog open={openDialog} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px] lg:max-w-xl">
        <DialogHeader className="gap-0 mb-2">
          <DialogTitle className="text-3xl text-primary">
            Registrar encontro
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {meeting
              ? `Encontro de ${formatDayMonthYear(meeting.meetingDate)}${
                  bookTitle ? ` · ${bookTitle}` : ""
                }`
              : null}
          </DialogDescription>
        </DialogHeader>

        {meeting?.book ? (
          <div className="mb-4 flex items-center gap-3 rounded-md border border-secondary/60 p-3">
            {meeting.book.coverUrl ? (
              <img
                src={meeting.book.coverUrl}
                alt=""
                className="h-16 w-11 rounded object-cover"
              />
            ) : null}
            <div className="min-w-0">
              <p className="font-medium truncate">{meeting.book.title}</p>
              {meeting.book.author ? (
                <p className="text-sm text-muted-foreground truncate">
                  {meeting.book.author}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <MeetingRecapForm
          value={recapForm}
          onChange={setRecapForm}
          disabled={isSaving || isDismissing}
          idPrefix="prompt-recap"
        />

        <DialogFooter className="mt-5 flex-col gap-2 sm:flex-row">
          {showDismissButton ? (
            <Button
              type="button"
              variant="outline"
              disabled={isSaving || isDismissing}
              onClick={() => dismissPrompt()}
              className="w-full sm:w-auto"
            >
              Agora não
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={isSaving || isDismissing}
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="button"
            disabled={isSaving || isDismissing}
            onClick={() => saveRecap()}
            className="w-full sm:w-auto"
          >
            {isSaving ? "Salvando…" : "Publicar registro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingRecapDialog;
