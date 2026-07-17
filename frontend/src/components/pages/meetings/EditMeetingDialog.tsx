import { useEffect, useState } from "react";
import {
  FormProvider,
  useForm,
  type SubmitHandler,
} from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { updateMeeting } from "@/api/mutations/meetingMutate";
import {
  createMeetingRecap,
  deleteMeetingRecap,
  updateMeetingRecap,
} from "@/api/mutations/meetingRecapMutate";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBook } from "@/contexts/BookContext";
import { useClub } from "@/contexts/ClubContext";
import type { IApiError } from "@/types/IApi";
import type { IMeeting, IMeetingUpdatePayload } from "@/types/IMeetings";
import {
  MEETING_NO_BOOK_SELECT_VALUE,
  MEETING_STATUS_COMPLETED,
  MEETING_STATUS_SCHEDULED,
} from "@/utils/constants/meeting";
import {
  formatMeetingDateForApi,
  parseLocalDate,
  formatMeetingTimeForApi,
  formatTime,
} from "@/utils/formatters";
import { CompletedMeetingRecapSection } from "./CompletedMeetingRecapSection";
import {
  MeetingFormFields,
  type MeetingFormValues,
} from "./MeetingFormFields";
import MeetingGoogleCalendarFormNote from "./MeetingGoogleCalendarFormNote";
import {
  emptyMeetingRecapFormValue,
  meetingRecapHasContent,
  type MeetingRecapFormValue,
} from "./MeetingRecapForm";

type EditMeetingDialogProps = {
  openDialog: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: IMeeting | undefined;
  initialRecapExpanded?: boolean;
};

function toFormValues(meeting: IMeeting): MeetingFormValues {
  return {
    location: meeting.location || "",
    meetingDate: parseLocalDate(meeting.meetingDate) ?? undefined,
    meetingTime: meeting.meetingTime ? formatTime(meeting.meetingTime) : "",
    description: meeting.description || "",
    bookId: meeting.book?.id ?? MEETING_NO_BOOK_SELECT_VALUE,
    chapterStart: meeting.chapterStart ?? undefined,
    chapterEnd: meeting.chapterEnd ?? undefined,
    totalChapters: undefined,
  };
}

export default function EditMeetingDialog({
  openDialog,
  onOpenChange,
  meeting,
  initialRecapExpanded = false,
}: EditMeetingDialogProps) {
  const { selectedClubId, clubs } = useClub();
  const { booksFromSelectedClub } = useBook();
  const queryClient = useQueryClient();
  const isCompletedMeeting = meeting?.status === MEETING_STATUS_COMPLETED;
  const [recapExpanded, setRecapExpanded] = useState(false);
  const [recapForm, setRecapForm] = useState<MeetingRecapFormValue>(
    emptyMeetingRecapFormValue(),
  );

  const form = useForm<MeetingFormValues>({
    defaultValues: meeting ? toFormValues(meeting) : undefined,
  });
  const { handleSubmit, reset, watch, setValue } = form;

  const selectedClub = clubs.find((club) => club.id === selectedClubId);
  const isChaptersMode = selectedClub?.readingMode === "chapters";
  const selectedBookId = watch("bookId");
  const selectedBook = booksFromSelectedClub.find(
    (book) => book.id === selectedBookId,
  );
  const needsTotalChapters = Boolean(
    isChaptersMode && selectedBook && selectedBook.totalChapters == null,
  );

  useEffect(() => {
    if (!meeting) return;
    reset(toFormValues(meeting));
    setRecapForm(emptyMeetingRecapFormValue(meeting.recap));
    setRecapExpanded(
      Boolean(meeting.recap) ||
        (meeting.status === MEETING_STATUS_COMPLETED && initialRecapExpanded),
    );
  }, [meeting, reset, openDialog, initialRecapExpanded]);

  useEffect(() => {
    setValue("totalChapters", undefined);
  }, [selectedBookId, setValue]);

  const invalidateMeetingQueries = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["meetings", selectedClubId],
    });
    await queryClient.invalidateQueries({
      queryKey: ["pastMeetings", selectedClubId],
    });
    await queryClient.invalidateQueries({
      queryKey: ["booksFromSelectedClub", selectedClubId],
    });
    await queryClient.invalidateQueries({
      queryKey: ["myUpcomingMeetings"],
      refetchType: "all",
    });
    await queryClient.invalidateQueries({ queryKey: ["myFeed"] });
    await queryClient.invalidateQueries({
      queryKey: ["pendingMeetingRecap"],
    });
  };

  const { mutate: saveMeeting, isPending } = useMutation({
    mutationFn: async (payload: {
      meetingPayload: IMeetingUpdatePayload;
      recapAction: "none" | "create" | "update" | "delete";
      recapForm: MeetingRecapFormValue;
    }) => {
      await updateMeeting(payload.meetingPayload);

      if (payload.recapAction === "create") {
        await createMeetingRecap({
          meetingId: payload.meetingPayload.id,
          text: payload.recapForm.text,
          image: payload.recapForm.imageFile,
        });
      } else if (payload.recapAction === "update") {
        await updateMeetingRecap({
          meetingId: payload.meetingPayload.id,
          text: payload.recapForm.text,
          image: payload.recapForm.imageFile,
          removeImage: payload.recapForm.removeImage,
        });
      } else if (payload.recapAction === "delete") {
        await deleteMeetingRecap(payload.meetingPayload.id);
      }
    },
    onSuccess: async () => {
      await invalidateMeetingQueries();
      reset();
      onOpenChange(false);
      toast.success("Encontro salvo com sucesso!");
    },
    onError: (error: IApiError) => {
      toast.error(
        error.message ||
          "Não foi possível salvar o encontro, tente novamente.",
      );
    },
  });

  const { mutate: deleteRecapMutate, isPending: isDeletingRecap } = useMutation({
    mutationFn: async () => {
      if (!meeting) throw { message: "Encontro não encontrado." };
      return deleteMeetingRecap(meeting.id);
    },
    onSuccess: async () => {
      await invalidateMeetingQueries();
      setRecapForm(emptyMeetingRecapFormValue());
      setRecapExpanded(false);
      toast.success("Registro do encontro removido.");
    },
    onError: (error: IApiError) => {
      toast.error(error.message || "Erro ao remover registro.");
    },
  });

  const onSubmit: SubmitHandler<MeetingFormValues> = (data) => {
    if (!selectedClubId || !meeting) {
      toast.error("Você não pode editar um encontro sem estar em um clube");
      return;
    }
    if (!data.meetingDate) return;

    const resolvedBookId =
      data.bookId === MEETING_NO_BOOK_SELECT_VALUE ? null : data.bookId;
    const shouldSendChapterRange = Boolean(isChaptersMode && resolvedBookId);

    let recapAction: "none" | "create" | "update" | "delete" = "none";
    if (isCompletedMeeting) {
      if (meeting.recap && recapExpanded) {
        if (!meetingRecapHasContent(recapForm)) {
          toast.error(
            "Informe um texto ou uma foto, ou apague o registro do encontro.",
          );
          return;
        }
        recapAction = "update";
      } else if (!meeting.recap && recapExpanded) {
        if (!meetingRecapHasContent(recapForm)) {
          toast.error(
            "Informe um texto ou uma foto para o registro do encontro.",
          );
          return;
        }
        recapAction = "create";
      }
    }

    saveMeeting({
      meetingPayload: {
        id: meeting.id,
        bookId: resolvedBookId,
        chapterStart: shouldSendChapterRange ? (data.chapterStart ?? null) : null,
        chapterEnd: shouldSendChapterRange ? (data.chapterEnd ?? null) : null,
        totalChapters:
          shouldSendChapterRange && needsTotalChapters
            ? data.totalChapters
            : undefined,
        description: data.description,
        location: data.location,
        meetingDate: formatMeetingDateForApi(data.meetingDate),
        meetingTime: formatMeetingTimeForApi(data.meetingTime),
        status: isCompletedMeeting
          ? MEETING_STATUS_COMPLETED
          : MEETING_STATUS_SCHEDULED,
        clubId: selectedClubId,
      },
      recapAction,
      recapForm,
    });
  };

  return (
    <Dialog open={openDialog} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px] lg:max-w-2xl">
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader className="mb-4 gap-0 text-left">
              <DialogTitle className="text-left text-3xl text-primary">
                {isCompletedMeeting ? "Registro do encontro" : "Editar encontro"}
              </DialogTitle>
            </DialogHeader>

            {!isCompletedMeeting ? <MeetingGoogleCalendarFormNote /> : null}

            <MeetingFormFields
              books={booksFromSelectedClub}
              isChaptersMode={isChaptersMode}
              needsTotalChapters={needsTotalChapters}
            />

            {isCompletedMeeting && meeting ? (
              <CompletedMeetingRecapSection
                meeting={meeting}
                recapExpanded={recapExpanded}
                recapForm={recapForm}
                disabled={isPending || isDeletingRecap}
                onRecapFormChange={setRecapForm}
                onExpand={() => setRecapExpanded(true)}
                onCollapse={() => setRecapExpanded(false)}
                onDelete={() => deleteRecapMutate()}
              />
            ) : null}

            <DialogFooter className="mt-5 flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending || isDeletingRecap}
                className="w-full sm:w-auto"
              >
                {isPending ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
