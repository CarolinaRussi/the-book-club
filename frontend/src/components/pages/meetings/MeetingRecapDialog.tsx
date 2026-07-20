import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
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
    "id" | "meetingDate" | "books" | "recap"
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

  const books = meeting?.books ?? [];

  return (
    <ResponsiveDialog open={openDialog} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-[425px] lg:max-h-[90vh] lg:max-w-xl lg:overflow-y-auto">
        <div className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialogHeader className="mb-2 gap-0 text-left">
            <ResponsiveDialogTitle className="text-left text-3xl text-primary">
              Registrar encontro
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription className="text-left text-sm text-muted-foreground">
              {meeting
                ? `Encontro de ${formatDayMonthYear(meeting.meetingDate)}`
                : null}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <ResponsiveDialogBody className="space-y-4">
            {books.length > 0 ? (
              <div className="flex flex-col gap-2 rounded-md border border-secondary/60 p-3">
                {books.map((book) => (
                  <div key={book.id} className="flex items-center gap-3">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt=""
                        className="h-16 w-11 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="h-16 w-11 shrink-0 rounded bg-muted" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium leading-snug">{book.title}</p>
                      {book.author ? (
                        <p className="text-sm text-muted-foreground truncate">
                          {book.author}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <MeetingRecapForm
              value={recapForm}
              onChange={setRecapForm}
              disabled={isSaving || isDismissing}
              idPrefix="prompt-recap"
            />
          </ResponsiveDialogBody>

          <ResponsiveDialogFooter className="mt-5 flex-col gap-2 sm:flex-row">
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
          </ResponsiveDialogFooter>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

export default MeetingRecapDialog;
