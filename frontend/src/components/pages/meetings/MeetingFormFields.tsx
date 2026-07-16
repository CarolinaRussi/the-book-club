import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MEETING_NO_BOOK_SELECT_VALUE } from "@/utils/constants/meeting";

export type MeetingFormValues = {
  location: string;
  meetingDate?: Date;
  meetingTime: string;
  description?: string;
  bookId: string;
  chapterStart?: number;
  chapterEnd?: number;
  totalChapters?: number;
};

type MeetingBookOption = {
  id: string;
  title: string;
};

type MeetingFormFieldsProps = {
  books: MeetingBookOption[];
  isChaptersMode: boolean;
  needsTotalChapters: boolean;
};

export function MeetingFormFields({
  books,
  isChaptersMode,
  needsTotalChapters,
}: MeetingFormFieldsProps) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<MeetingFormValues>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const selectedBookId = watch("bookId");
  const showChapters =
    isChaptersMode &&
    selectedBookId &&
    selectedBookId !== MEETING_NO_BOOK_SELECT_VALUE;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="mb-1 text-lg font-medium">Onde:</h3>
        <Input
          {...register("location", { required: true })}
          placeholder="Aroma Café"
          className="w-full rounded-md border-2 border-secondary bg-background p-2 text-foreground"
        />
        {errors.location ? (
          <p className="text-xs text-primary">
            Local do encontro deve ser preenchido
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="mb-1 text-lg font-medium">Quando:</h3>
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
          <h3 className="mb-1 text-lg font-medium">Horário:</h3>
          <Input
            type="time"
            {...register("meetingTime", { required: true })}
            id="time-picker"
            step="0"
            className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-1 text-lg font-medium">Observação:</h3>
        <textarea
          {...register("description")}
          placeholder="Trazer canetas e papéis..."
          className="w-full rounded-md border-2 border-secondary bg-background p-2 text-foreground"
        />
      </div>

      <div>
        <h3 className="mb-1 text-lg font-medium">
          Livro para discussão (opcional):
        </h3>
        <Controller
          name="bookId"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="text-md w-full cursor-pointer border-2 border-secondary py-5">
                <SelectValue placeholder="Selecione um livro" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-secondary bg-background">
                <SelectItem
                  value={MEETING_NO_BOOK_SELECT_VALUE}
                  className="text-md cursor-pointer p-3"
                >
                  Sem livro
                </SelectItem>
                {books.map((book) => (
                  <SelectItem
                    key={book.id}
                    value={book.id}
                    className="text-md cursor-pointer p-3"
                  >
                    {book.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {showChapters ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <h3 className="mb-1 text-lg font-medium">Capítulo inicial:</h3>
            <Input
              type="number"
              min={1}
              {...register("chapterStart", { valueAsNumber: true })}
              className="w-full rounded-md border-2 border-secondary bg-background p-2 text-foreground"
              placeholder="Ex.: 1"
            />
          </div>
          <div>
            <h3 className="mb-1 text-lg font-medium">Capítulo final:</h3>
            <Input
              type="number"
              min={1}
              {...register("chapterEnd", { valueAsNumber: true })}
              className="w-full rounded-md border-2 border-secondary bg-background p-2 text-foreground"
              placeholder="Ex.: 3"
            />
          </div>
        </div>
      ) : null}

      {needsTotalChapters ? (
        <div>
          <h3 className="mb-1 text-lg font-medium">
            Total de capítulos do livro:
          </h3>
          <Input
            type="number"
            min={1}
            {...register("totalChapters", {
              valueAsNumber: true,
              required: "Informe o total de capítulos do livro.",
              validate: (value) =>
                (Number.isInteger(value) && Number(value) >= 1) ||
                "Informe um número inteiro positivo.",
            })}
            className="w-full rounded-md border-2 border-secondary bg-background p-2 text-foreground"
            placeholder="Ex.: 24"
          />
          {errors.totalChapters ? (
            <p className="mt-1 text-xs text-primary">
              {errors.totalChapters.message}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
