import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { toast } from "react-toastify";
import { useClub } from "@/contexts/ClubContext";
import type { IMeeting, IMeetingUpdatePayload } from "@/types/IMeetings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "../../ui/input";
import { useBook } from "@/contexts/BookContext";
import {
  formatTime,
  formatMeetingDateForApi,
  formatMeetingTimeForApi,
} from "@/utils/formatters";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IApiError } from "@/types/IApi";
import { updateMeeting } from "@/api/mutations/meetingMutate";
import {
  createMeetingRecap,
  deleteMeetingRecap,
  updateMeetingRecap,
} from "@/api/mutations/meetingRecapMutate";
import {
  MEETING_NO_BOOK_SELECT_VALUE,
  MEETING_STATUS_COMPLETED,
  MEETING_STATUS_SCHEDULED,
} from "@/utils/constants/meeting";
import MeetingGoogleCalendarFormNote from "./MeetingGoogleCalendarFormNote";
import MeetingRecapForm, {
  emptyMeetingRecapFormValue,
  meetingRecapHasContent,
  type MeetingRecapFormValue,
} from "./MeetingRecapForm";

interface EditMeetingDialogProps {
  openDialog: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: IMeeting | undefined;
  initialRecapExpanded?: boolean;
}

interface IEditMeetingForm {
  location: string;
  meetingDate: Date;
  meetingTime: string;
  description?: string;
  bookId: string;
  chapterStart?: number;
  chapterEnd?: number;
  totalChapters?: number;
}

const EditMeetingDialog = ({
  openDialog,
  onOpenChange,
  meeting,
  initialRecapExpanded = false,
}: EditMeetingDialogProps) => {
  const { selectedClubId, clubs } = useClub();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { booksFromSelectedClub } = useBook();
  const queryClient = useQueryClient();
  const isCompletedMeeting = meeting?.status === MEETING_STATUS_COMPLETED;
  const [recapExpanded, setRecapExpanded] = useState(false);
  const [recapForm, setRecapForm] = useState<MeetingRecapFormValue>(
    emptyMeetingRecapFormValue(),
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IEditMeetingForm>({
    defaultValues: {
      location: meeting?.location || "",
      meetingDate: meeting ? new Date(meeting.meetingDate) : undefined,
      meetingTime: meeting?.meetingTime ? formatTime(meeting.meetingTime) : "",
      description: meeting?.description || "",
      bookId: meeting?.book?.id ?? MEETING_NO_BOOK_SELECT_VALUE,
      chapterStart: meeting?.chapterStart ?? undefined,
      chapterEnd: meeting?.chapterEnd ?? undefined,
      totalChapters: undefined,
    },
  });

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
    if (meeting) {
      reset({
        location: meeting.location || "",
        meetingDate: new Date(meeting.meetingDate),
        meetingTime: meeting.meetingTime ? formatTime(meeting.meetingTime) : "",
        description: meeting.description || "",
        bookId: meeting.book?.id ?? MEETING_NO_BOOK_SELECT_VALUE,
        chapterStart: meeting.chapterStart ?? undefined,
        chapterEnd: meeting.chapterEnd ?? undefined,
        totalChapters: undefined,
      });
      setRecapForm(emptyMeetingRecapFormValue(meeting.recap));
      setRecapExpanded(
        Boolean(meeting.recap) ||
          (meeting.status === MEETING_STATUS_COMPLETED && initialRecapExpanded),
      );
    }
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
      if (!meeting) {
        throw { message: "Encontro não encontrado." };
      }
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

  const onSubmit: SubmitHandler<IEditMeetingForm> = (data) => {
    if (!selectedClubId || !meeting) {
      toast.error("Você não pode editar um encontro sem estar em um clube");
      return;
    }
    const {
      bookId,
      chapterStart,
      chapterEnd,
      description,
      location,
      meetingDate,
      meetingTime,
      totalChapters,
    } = data;
    const resolvedBookId =
      bookId === MEETING_NO_BOOK_SELECT_VALUE ? null : bookId;
    const shouldSendChapterRange = isChaptersMode && resolvedBookId;
    const resolvedTotalChapters =
      totalChapters && Number.isFinite(totalChapters) && totalChapters > 0
        ? totalChapters
        : undefined;

    if (needsTotalChapters && !resolvedTotalChapters) {
      toast.error("Informe o total de capítulos do livro.");
      return;
    }

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
        chapterStart: shouldSendChapterRange ? (chapterStart ?? null) : null,
        chapterEnd: shouldSendChapterRange ? (chapterEnd ?? null) : null,
        totalChapters:
          shouldSendChapterRange && needsTotalChapters
            ? resolvedTotalChapters
            : undefined,
        description,
        location,
        meetingDate: formatMeetingDateForApi(meetingDate),
        meetingTime: formatMeetingTimeForApi(meetingTime),
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader className="gap-0 mb-4">
            <DialogTitle className="text-3xl text-primary">
              {isCompletedMeeting ? "Registro do encontro" : "Editar encontro"}
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          {!isCompletedMeeting ? <MeetingGoogleCalendarFormNote /> : null}

          <div className="flex flex-col gap-3">
            <div>
              <h3 className="text-lg font-medium mb-1">Onde:</h3>
              <Input
                {...register("location", { required: true })}
                placeholder="Aroma Café"
                className="border-2 border-secondary rounded-md p-2 w-full text-foreground bg-background"
              />
              {errors.location && (
                <h3 className="text-xs text-primary">
                  Local do encontro deve ser preenchido
                </h3>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <div className="w-full">
                <h3 className="text-lg font-medium mb-1">Quando:</h3>
                <Controller
                  name="meetingDate"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="date-picker"
                          className="w-full justify-between font-normal"
                        >
                          {field.value
                            ? field.value.toLocaleDateString("pt-BR")
                            : "Selecione a data"}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setCalendarOpen(false);
                          }}
                          className="rounded-lg border [--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
                          buttonVariant="ghost"
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
              <div className="w-full">
                <h3 className="text-lg font-medium mb-1">Horário:</h3>
                <Input
                  type="time"
                  {...register("meetingTime", { required: true })}
                  id="time-picker"
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-1">Observação:</h3>
              <textarea
                {...register("description")}
                placeholder="Trazer canetas e papéis..."
                className="border-2 border-secondary rounded-md p-2 w-full text-foreground bg-background"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-1">
                Livro para discussão (opcional):
              </h3>
              <Controller
                name="bookId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full border-2 border-secondary text-md py-5 cursor-pointer">
                      <SelectValue placeholder="Selecione um livro" />
                    </SelectTrigger>
                    <SelectContent className="border-secondary bg-background rounded-lg">
                      <SelectItem
                        value={MEETING_NO_BOOK_SELECT_VALUE}
                        className="cursor-pointer text-md p-3"
                      >
                        Sem livro
                      </SelectItem>
                      {booksFromSelectedClub.map((book) => (
                        <SelectItem
                          key={book.id}
                          value={book.id}
                          className="cursor-pointer text-md p-3"
                        >
                          {book.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {isChaptersMode &&
              selectedBookId &&
              selectedBookId !== MEETING_NO_BOOK_SELECT_VALUE && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <h3 className="text-lg font-medium mb-1">
                      Capítulo inicial:
                    </h3>
                    <Input
                      type="number"
                      min={1}
                      {...register("chapterStart", { valueAsNumber: true })}
                      className="border-2 border-secondary rounded-md p-2 w-full text-foreground bg-background"
                      placeholder="Ex.: 1"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">
                      Capítulo final:
                    </h3>
                    <Input
                      type="number"
                      min={1}
                      {...register("chapterEnd", { valueAsNumber: true })}
                      className="border-2 border-secondary rounded-md p-2 w-full text-foreground bg-background"
                      placeholder="Ex.: 3"
                    />
                  </div>
                </div>
              )}
            {needsTotalChapters && (
              <div>
                <h3 className="text-lg font-medium mb-1">
                  Total de capítulos do livro:
                </h3>
                <Input
                  type="number"
                  min={1}
                  {...register("totalChapters", {
                    valueAsNumber: true,
                    validate: (value) =>
                      !needsTotalChapters ||
                      (Number.isInteger(value) && value >= 1) ||
                      "Informe um número inteiro positivo.",
                  })}
                  className="border-2 border-secondary rounded-md p-2 w-full text-foreground bg-background"
                  placeholder="Ex.: 24"
                />
                {errors.totalChapters && (
                  <p className="text-xs text-primary mt-1">
                    {errors.totalChapters.message}
                  </p>
                )}
              </div>
            )}

            {isCompletedMeeting ? (
              <div className="mt-2 border-t border-secondary/50 pt-4">
                <h3 className="text-xl font-semibold mb-3">
                  Memória do encontro
                </h3>
                {meeting?.recap || recapExpanded ? (
                  <div className="flex flex-col gap-3">
                    <MeetingRecapForm
                      value={recapForm}
                      onChange={setRecapForm}
                      disabled={isPending || isDeletingRecap}
                      idPrefix="completed-recap"
                    />
                    {meeting?.recap ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isPending || isDeletingRecap}
                        onClick={() => deleteRecapMutate()}
                        className="w-full sm:w-auto self-start"
                      >
                        Apagar registro
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() => {
                          setRecapExpanded(false);
                          setRecapForm(emptyMeetingRecapFormValue());
                        }}
                        className="w-full sm:w-auto self-start"
                      >
                        Fechar registro
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setRecapExpanded(true)}
                    className="w-full sm:w-auto"
                  >
                    Registrar encontro
                  </Button>
                )}
              </div>
            ) : null}
          </div>

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
      </DialogContent>
    </Dialog>
  );
};

export default EditMeetingDialog;
