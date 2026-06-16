import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { toast } from "react-toastify";
import type { IMeetingCreatePayload } from "@//types/IMeetings";
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
import React from "react";
import { Input } from "../../ui/input";
import { useBook } from "@//contexts/BookContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IApiError } from "@//types/IApi";
import { createMeeting } from "@//api/mutations/meetingMutate";
import {
  BOOK_STATUS_STARTED,
  BOOK_STATUS_SUGGESTED,
} from "@//utils/constants/books";
import { useClub } from "@//contexts/ClubContext";
import {
  formatMeetingDateForApi,
  formatMeetingTimeForApi,
} from "@//utils/formatters";
import { MEETING_NO_BOOK_SELECT_VALUE } from "@//utils/constants/meeting";
import MeetingGoogleCalendarFormNote from "./MeetingGoogleCalendarFormNote";

interface CreateMeetingDialogProps {
  openDialog: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ICreateMeetingForm {
  location: string;
  meetingDate: Date;
  meetingTime: string;
  description?: string;
  bookId: string;
  chapterStart?: number;
  chapterEnd?: number;
  totalChapters?: number;
}

const CreateMeetingDialog = ({
  openDialog,
  onOpenChange,
}: CreateMeetingDialogProps) => {
  const { selectedClubId, clubs } = useClub();
  const [open, setOpen] = React.useState(false);
  const { booksFromSelectedClub } = useBook();
  const queryClient = useQueryClient();

  const {
    register,
    control,
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ICreateMeetingForm>({
    defaultValues: {
      location: "",
      meetingDate: undefined,
      meetingTime: "",
      description: "",
      bookId: MEETING_NO_BOOK_SELECT_VALUE,
      chapterStart: undefined,
      chapterEnd: undefined,
      totalChapters: undefined,
    },
  });

  const selectedClub = clubs.find((club) => club.id === selectedClubId);
  const isChaptersMode = selectedClub?.readingMode === "chapters";
  const selectedBookId = watch("bookId");
  const selectedBook = booksFromSelectedClub.find(
    (book) => book.id === selectedBookId
  );
  const needsTotalChapters = Boolean(
    isChaptersMode && selectedBook && selectedBook.totalChapters == null
  );

  const { mutate: createMeetingMutate, isPending } = useMutation<
    any,
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
      reset();
      onOpenChange(false);
      toast.success("Encontro marcado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível marcar seu encontro.");
    },
  });

  React.useEffect(() => {
    reset();
  }, [openDialog]);

  React.useEffect(() => {
    setValue("totalChapters", undefined);
  }, [selectedBookId, setValue]);

  const onSubmit: SubmitHandler<ICreateMeetingForm> = (data) => {
    if (!selectedClubId) {
      toast.error("Você não pode adicionar um livro sem estar em um clube");
      return;
    }

    const {
      bookId,
      description,
      location,
      meetingDate,
      meetingTime,
      chapterStart,
      chapterEnd,
      totalChapters,
    } = data;

    const resolvedBookId =
      bookId && bookId !== MEETING_NO_BOOK_SELECT_VALUE ? bookId : undefined;
    const shouldSendChapterRange = isChaptersMode && resolvedBookId;
    const resolvedTotalChapters =
      totalChapters && Number.isFinite(totalChapters) && totalChapters > 0
        ? totalChapters
        : undefined;

    if (needsTotalChapters && !resolvedTotalChapters) {
      toast.error("Informe o total de capítulos do livro.");
      return;
    }

    createMeetingMutate({
      ...(resolvedBookId ? { bookId: resolvedBookId } : {}),
      ...(shouldSendChapterRange
        ? {
            chapterStart: chapterStart ?? null,
            chapterEnd: chapterEnd ?? null,
            ...(needsTotalChapters
              ? { totalChapters: resolvedTotalChapters }
              : {}),
          }
        : {}),
      description,
      location,
      meetingDate: formatMeetingDateForApi(meetingDate),
      meetingTime: formatMeetingTimeForApi(meetingTime),
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader className="gap-0 mb-4">
            <DialogTitle className="text-3xl text-primary">
              Marcar encontro
            </DialogTitle>
          </DialogHeader>

          <MeetingGoogleCalendarFormNote />

          <div className="flex flex-col gap-3">
            <div>
              <h3 className="text-lg font-medium mb-1">Onde:</h3>
              <Input
                {...register("location", { required: true })}
                placeholder="Aroma Café"
                className="border-2 border-secondary rounded-md p-2 w-full text-foreground bg-background"
              />
            </div>
            <div className="flex flex-row justify-between gap-3">
              <div className="w-full">
                <h3 className="text-lg font-medium mb-1">Quando:</h3>
                <Controller
                  name="meetingDate"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Popover open={open} onOpenChange={setOpen}>
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
                            setOpen(false);
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
                  step="0"
                  defaultValue="10:30"
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
                      {booksFromSelectedClub
                        .filter(
                          (book) =>
                            book.status === BOOK_STATUS_SUGGESTED ||
                            book.status === BOOK_STATUS_STARTED
                        )
                        .map((book) => (
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
                    <h3 className="text-lg font-medium mb-1">Capítulo inicial:</h3>
                    <Input
                      type="number"
                      min={1}
                      {...register("chapterStart", { valueAsNumber: true })}
                      className="border-2 border-secondary rounded-md p-2 w-full text-foreground bg-background"
                      placeholder="Ex.: 1"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Capítulo final:</h3>
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
          </div>

          <DialogFooter className=" mt-5 ">
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
      </DialogContent>
    </Dialog>
  );
};

export default CreateMeetingDialog;
