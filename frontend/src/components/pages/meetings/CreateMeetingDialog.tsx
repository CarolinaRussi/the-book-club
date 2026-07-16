import { useEffect } from "react";
import {
  FormProvider,
  useForm,
  type SubmitHandler,
} from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createMeeting } from "@/api/mutations/meetingMutate";
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
import type { IMeetingCreatePayload } from "@/types/IMeetings";
import {
  BOOK_STATUS_STARTED,
  BOOK_STATUS_SUGGESTED,
} from "@/utils/constants/books";
import { MEETING_NO_BOOK_SELECT_VALUE } from "@/utils/constants/meeting";
import {
  formatMeetingDateForApi,
  formatMeetingTimeForApi,
} from "@/utils/formatters";
import {
  MeetingFormFields,
  type MeetingFormValues,
} from "./MeetingFormFields";
import MeetingGoogleCalendarFormNote from "./MeetingGoogleCalendarFormNote";

type CreateMeetingDialogProps = {
  openDialog: boolean;
  onOpenChange: (open: boolean) => void;
};

const emptyValues: MeetingFormValues = {
  location: "",
  meetingDate: undefined,
  meetingTime: "",
  description: "",
  bookId: MEETING_NO_BOOK_SELECT_VALUE,
  chapterStart: undefined,
  chapterEnd: undefined,
  totalChapters: undefined,
};

export default function CreateMeetingDialog({
  openDialog,
  onOpenChange,
}: CreateMeetingDialogProps) {
  const { selectedClubId, clubs } = useClub();
  const { booksFromSelectedClub } = useBook();
  const queryClient = useQueryClient();

  const form = useForm<MeetingFormValues>({
    defaultValues: emptyValues,
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
  const bookOptions = booksFromSelectedClub.filter(
    (book) =>
      book.status === BOOK_STATUS_SUGGESTED ||
      book.status === BOOK_STATUS_STARTED,
  );

  const { mutate: createMeetingMutate, isPending } = useMutation<
    unknown,
    IApiError,
    IMeetingCreatePayload
  >({
    mutationFn: createMeeting,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["meetings", selectedClubId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["pastMeetings", selectedClubId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["booksFromSelectedClub", selectedClubId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["myUpcomingMeetings"],
          refetchType: "all",
        }),
      ]);
      reset(emptyValues);
      onOpenChange(false);
      toast.success("Encontro marcado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível marcar seu encontro.");
    },
  });

  useEffect(() => {
    if (openDialog) reset(emptyValues);
  }, [openDialog, reset]);

  useEffect(() => {
    setValue("totalChapters", undefined);
  }, [selectedBookId, setValue]);

  const onSubmit: SubmitHandler<MeetingFormValues> = (data) => {
    if (!selectedClubId) {
      toast.error("Você não pode adicionar um livro sem estar em um clube");
      return;
    }
    if (!data.meetingDate) return;

    const resolvedBookId =
      data.bookId && data.bookId !== MEETING_NO_BOOK_SELECT_VALUE
        ? data.bookId
        : undefined;
    const shouldSendChapterRange = isChaptersMode && resolvedBookId;

    createMeetingMutate({
      ...(resolvedBookId ? { bookId: resolvedBookId } : {}),
      ...(shouldSendChapterRange
        ? {
            chapterStart: data.chapterStart ?? null,
            chapterEnd: data.chapterEnd ?? null,
            ...(needsTotalChapters
              ? { totalChapters: data.totalChapters }
              : {}),
          }
        : {}),
      description: data.description,
      location: data.location,
      meetingDate: formatMeetingDateForApi(data.meetingDate),
      meetingTime: formatMeetingTimeForApi(data.meetingTime),
      clubId: selectedClubId,
    });
  };

  return (
    <Dialog
      open={openDialog}
      onOpenChange={(open) => {
        if (isPending) return;
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[425px] lg:max-w-2xl">
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader className="mb-4 gap-0">
              <DialogTitle className="text-3xl text-primary">
                Marcar encontro
              </DialogTitle>
            </DialogHeader>

            <MeetingGoogleCalendarFormNote />

            <MeetingFormFields
              books={bookOptions}
              isChaptersMode={isChaptersMode}
              needsTotalChapters={needsTotalChapters}
            />

            <DialogFooter className="mt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Marcando…" : "Marcar encontro"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
