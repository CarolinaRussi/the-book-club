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

export type MeetingFormValues = {
  location: string;
  meetingDate?: Date;
  meetingTime: string;
  description?: string;
  bookIds: string[];
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
  maxBooks: number;
};

export function MeetingFormFields({
  books,
  isChaptersMode,
  needsTotalChapters,
  maxBooks,
}: MeetingFormFieldsProps) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<MeetingFormValues>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const selectedBookIds = watch("bookIds") ?? [];
  const showChapters =
    isChaptersMode && selectedBookIds.length === 1;

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
          {maxBooks > 1
            ? `Livros para discussão (opcional, até ${maxBooks}):`
            : "Livro para discussão (opcional):"}
        </h3>
        <Controller
          name="bookIds"
          control={control}
          render={({ field }) => {
            const selectedIds = field.value ?? [];
            return (
            <div className="flex max-h-48 flex-col gap-2 overflow-y-auto rounded-md border-2 border-secondary bg-background p-2">
              {books.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum livro disponível na biblioteca do clube.
                </p>
              ) : (
                books.map((book) => {
                  const isSelected = selectedIds.includes(book.id);
                  const atMax = selectedIds.length >= maxBooks;

                  return (
                    <label
                      key={book.id}
                      className="flex cursor-pointer items-start gap-2 rounded-md px-1 py-1 hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            field.onChange(
                              selectedIds.filter(
                                (bookId) => bookId !== book.id
                              )
                            );
                            return;
                          }
                          if (maxBooks === 1) {
                            field.onChange([book.id]);
                            return;
                          }
                          if (!atMax) {
                            field.onChange([...selectedIds, book.id]);
                          }
                        }}
                      />
                      <span className="text-sm leading-snug">{book.title}</span>
                    </label>
                  );
                })
              )}
            </div>
            );
          }}
        />
        {(selectedBookIds.length > 0) ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {selectedBookIds.length} selecionado
            {selectedBookIds.length > 1 ? "s" : ""}
            {maxBooks > 1 ? ` (máx. ${maxBooks})` : null}
          </p>
        ) : null}
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
