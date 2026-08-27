import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RiResetLeftFill } from "react-icons/ri";
import { Rating } from "react-simple-star-rating";
import { toast } from "react-toastify";
import { saveReview } from "@/api/mutations/bookMutate";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import type { IApiError } from "@/types/IApi";
import type {
  IBookPageMyReview,
  IBookPageMyUserBook,
  IBookReviewPayload,
} from "@/types/IBooks";
import {
  READING_STATUS_NOT_STARTED,
  READING_STATUS_STARTED,
  READING_STATUS_WANT_TO_READ,
  readingStatusFormOptions,
  type ReadingStatus,
} from "@/utils/constants/reading";

type BookReviewFormValues = {
  rating: number;
  comment: string;
  readingStatus: ReadingStatus | undefined;
};

type BookPageReviewFormProps = {
  bookId: string;
  myUserBook: IBookPageMyUserBook | null;
  myReview: IBookPageMyReview | null;
};

export function BookPageReviewForm({
  bookId,
  myUserBook,
  myReview,
}: BookPageReviewFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, setValue } =
    useForm<BookReviewFormValues>({
      defaultValues: {
        rating: 0,
        comment: "",
        readingStatus: undefined,
      },
    });

  useEffect(() => {
    const status =
      myUserBook?.readingStatus === READING_STATUS_WANT_TO_READ
        ? undefined
        : myUserBook?.readingStatus;
    setValue("readingStatus", status);
    setValue("rating", myReview?.rating ?? 0);
    setValue("comment", myReview?.comment ?? "");
  }, [myUserBook, myReview, setValue]);

  const { mutate: saveReviewMutate, isPending } = useMutation<
    unknown,
    IApiError,
    IBookReviewPayload
  >({
    mutationFn: saveReview,
    onSuccess: async () => {
      toast.success("Avaliação salva com sucesso!");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["book", bookId] }),
        queryClient.invalidateQueries({ queryKey: ["booksFromSelectedClub"] }),
        queryClient.invalidateQueries({ queryKey: ["bookUsers"] }),
        queryClient.invalidateQueries({ queryKey: ["userReadings"] }),
        queryClient.invalidateQueries({ queryKey: ["myFeed"] }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message || "Avaliação com erro, tente novamente.");
    },
  });

  const onSubmit: SubmitHandler<BookReviewFormValues> = (data) => {
    if (!user) {
      toast.error("Usuário não encontrado, não é possível salvar.");
      return;
    }
    if (!data.readingStatus) {
      toast.error("Selecione o status da leitura antes de salvar.");
      return;
    }

    const hasRatingOrReview = data.rating > 0 || data.comment.trim() !== "";
    const blocksRating =
      data.readingStatus === READING_STATUS_NOT_STARTED ||
      data.readingStatus === READING_STATUS_STARTED;

    if (hasRatingOrReview && blocksRating) {
      toast.error(
        "Para adicionar nota ou comentário, o status deve ser 'Finalizado' ou 'Abandonado'.",
      );
      return;
    }

    saveReviewMutate({
      ...data,
      userId: user.id,
      bookId,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold text-primary">Sua avaliação</h2>
      <div>
        <h3 className="font-semibold text-primary">Nota:</h3>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <div className="flex flex-row items-end">
              <Rating
                initialValue={field.value}
                onClick={(rate) => field.onChange(rate)}
                allowFraction
                SVGstyle={{ display: "inline" }}
                size={25}
                fillColor="#be2c3f"
                emptyColor="#e2cad0"
              />
              <RiResetLeftFill
                onClick={() => field.onChange(0)}
                size={20}
                className="-bold ml-3 inline-flex cursor-pointer text-primary"
              />
            </div>
          )}
        />
      </div>
      <div>
        <h3 className="font-semibold text-primary">Comentário:</h3>
        <textarea
          {...register("comment")}
          className="mt-2 h-25 w-full rounded-sm border-2 px-3 py-2"
          placeholder="Escreva sua opinião sobre o livro..."
        />
      </div>
      <div>
        <h3 className="font-semibold text-primary">Status da leitura:</h3>
        <Controller
          name="readingStatus"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="text-md mt-2 w-full border-2 border-secondary py-5">
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-secondary bg-background">
                {readingStatusFormOptions.map(({ value, label }) => (
                  <SelectItem
                    key={value}
                    value={value}
                    className="text-md cursor-pointer p-3"
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <Button type="submit" className="mt-2 h-10 w-full" disabled={isPending}>
        {isPending ? "Salvando..." : "Salvar avaliação"}
      </Button>
    </form>
  );
}
