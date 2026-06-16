import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../ui/alert-dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import type {
  IBook,
  IBookReviewPayload,
  IBookTotalChaptersPayload,
  IReview,
} from "../../../types/IBooks";
import { Rating } from "react-simple-star-rating";
import { LuCalendarDays } from "react-icons/lu";
import { formatMonthYear, getInitials } from "../../../utils/formatters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IApiError } from "../../../types/IApi";
import {
  saveReview,
  updateBookTotalChapters,
} from "../../../api/mutations/bookMutate";
import { Card, CardTitle } from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { RiResetLeftFill } from "react-icons/ri";
import { Trash2 } from "lucide-react";
import {
  READING_STATUS_DROPPED,
  READING_STATUS_FINISHED,
  READING_STATUS_NOT_STARTED,
  READING_STATUS_STARTED,
  READING_STATUS_WANT_TO_READ,
  readingStatusLabels,
  type ReadingStatus,
} from "@//utils/constants/reading";
import { useClub } from "@//contexts/ClubContext";

interface IBookReviewForm {
  rating: number;
  comment: string;
  readingStatus: ReadingStatus | undefined;
  totalChapters?: number;
}

interface AddReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: IBook | undefined;
  canDeleteBook?: boolean;
  isDeletingBook?: boolean;
  onDeleteBook?: () => void;
}

const AddReviewDialog = ({
  open,
  onOpenChange,
  book,
  canDeleteBook = false,
  isDeletingBook = false,
  onDeleteBook,
}: AddReviewDialogProps) => {
  const { user } = useAuth();
  const { selectedClubId } = useClub();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: {},
    reset,
    control,
    setValue,
    getValues,
  } = useForm<IBookReviewForm>({
    defaultValues: {
      rating: 0,
      comment: "",
      readingStatus: undefined,
      totalChapters: undefined,
    },
  });

  useEffect(() => {
    if (open && book) {
      const userReview = book.reviews?.find(
        (r: IReview) => r.user.id === user?.id,
      );

      setValue("readingStatus", userReview?.readingStatus || undefined);
      setValue("rating", userReview?.rating || 0);
      setValue("comment", userReview?.comment || "");
      setValue("totalChapters", book.totalChapters ?? undefined);
    } else if (!open) {
      reset({
        rating: 0,
        comment: "",
        readingStatus: undefined,
        totalChapters: undefined,
      });
    }
  }, [open, book, user, setValue, reset]);

  const reviews = book?.reviews || [];
  const reviewsForAverage = reviews.filter(
    (r) => r.readingStatus === READING_STATUS_FINISHED,
  );
  const totalRating = reviewsForAverage.reduce(
    (acc, review) => acc + review.rating,
    0,
  );
  const averageRating =
    reviewsForAverage.length > 0 ? totalRating / reviewsForAverage.length : 0;

  const { mutate: saveReviewMutate, isPending } = useMutation<
    any,
    IApiError,
    IBookReviewPayload
  >({
    mutationFn: saveReview,
    onSuccess: async () => {
      toast.success("Avaliação salva com sucesso!");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["booksFromSelectedClub", selectedClubId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["bookUsers"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["myFeed"],
        }),
      ]);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Avaliação com erro, tente novamente.");
    },
  });

  const {
    mutate: updateBookTotalChaptersMutate,
    isPending: isUpdatingTotalChapters,
  } = useMutation<any, IApiError, IBookTotalChaptersPayload>({
    mutationFn: updateBookTotalChapters,
    onSuccess: async () => {
      toast.success("Total de capítulos atualizado com sucesso!");
      await queryClient.invalidateQueries({
        queryKey: ["booksFromSelectedClub"],
      });
    },
    onError: (error) => {
      toast.error(
        error.message || "Não foi possível atualizar o total de capítulos.",
      );
    },
  });

  const handleUpdateTotalChapters = () => {
    if (!selectedClubId || !book) {
      toast.error("Clube ou livro não encontrado, não é possível salvar.");
      return;
    }

    const totalChapters = getValues("totalChapters");

    if (
      typeof totalChapters !== "number" ||
      !Number.isInteger(totalChapters) ||
      totalChapters < 1
    ) {
      toast.error("Informe um número inteiro positivo.");
      return;
    }

    updateBookTotalChaptersMutate({
      clubId: selectedClubId,
      bookId: book.id,
      totalChapters,
    });
  };

  const onSubmit: SubmitHandler<IBookReviewForm> = (data) => {
    if (!selectedClubId || !user || !book) {
      toast.error(
        "Clube, livro ou usuário não encontrado, não é possível salvar.",
      );
      return;
    }

    if (!data.readingStatus) {
      toast.error("Selecione o status da leitura antes de salvar.");
      return;
    }

    const hasRatingOrReview = data.rating > 0 || data.comment.trim() !== "";

    const isInvalidStatusForRating =
      data.readingStatus === READING_STATUS_WANT_TO_READ ||
      data.readingStatus === READING_STATUS_NOT_STARTED ||
      data.readingStatus === READING_STATUS_STARTED;

    if (hasRatingOrReview && isInvalidStatusForRating) {
      toast.error(
        "Para adicionar nota ou comentário, o status deve ser 'Finalizado' ou 'Abandonado'.",
      );
      return;
    }

    const payload = {
      ...data,
      clubId: selectedClubId,
      userId: user.id,
      bookId: book.id,
    };

    saveReviewMutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100vw-2rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-6 pr-0 sm:max-w-[425px] lg:max-w-2xl">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden"
        >
          <DialogHeader className="shrink-0 gap-0 pr-8">
            <div className="flex flex-wrap items-start justify-center gap-2 text-center sm:justify-start sm:text-left">
              <DialogTitle className="line-clamp-3 min-w-0 max-w-[calc(100%-2rem)] text-2xl text-primary sm:text-3xl">
                {book?.title}
              </DialogTitle>
              {canDeleteBook && onDeleteBook && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className="mt-1 shrink-0 text-destructive transition-colors hover:text-destructive/80 md:hidden"
                      disabled={isDeletingBook}
                      title="Excluir livro"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir livro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir{" "}
                        <span className="font-semibold">{book?.title}</span> da
                        biblioteca do clube?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onDeleteBook}
                        disabled={isDeletingBook}
                        className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive"
                      >
                        Excluir livro
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto overscroll-contain pr-4">
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-4 sm:gap-3">
              <div className="mx-auto w-28 sm:mx-0 sm:w-auto">
                <img
                  src={book?.coverUrl}
                  alt={book?.title}
                  className="aspect-2/3 w-full rounded-2xl object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-col items-center gap-3 text-center sm:col-span-3 sm:items-start sm:text-left">
                <div className="text-warm-brown/70">{book?.author}</div>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Rating
                    initialValue={averageRating}
                    readonly
                    allowFraction
                    SVGstyle={{ display: "inline" }}
                    size={25}
                    fillColor="#be2c3f"
                    emptyColor="#e2cad0"
                  />
                  <span className="text-lg font-bold text-warm-brown/70">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-warm-brown/70">
                    ({reviewsForAverage.length}{" "}
                    {reviewsForAverage.length === 1
                      ? "avaliação"
                      : "avaliações"}
                    )
                  </span>
                </div>
                {book?.createdAt && (
                  <div className="flex items-center justify-between text-xs text-warm-brown/70">
                    <div className="flex items-center gap-1">
                      <LuCalendarDays size={20} />
                      Lido em {formatMonthYear(book.createdAt)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <hr className="my-4 "></hr>

            <div className="flex flex-col gap-3">
              <h1 className="text-primary font-semibold text-xl">
                Dados do livro
              </h1>
              <div>
                <h3 className="text-primary font-semibold">
                  Total de capítulos:
                </h3>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <Input
                    type="number"
                    min={1}
                    {...register("totalChapters", { valueAsNumber: true })}
                    className="border-2 border-secondary"
                    placeholder="Ex.: 24"
                  />
                  <Button
                    type="button"
                    onClick={handleUpdateTotalChapters}
                    disabled={isUpdatingTotalChapters}
                  >
                    {isUpdatingTotalChapters ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>
            </div>

            <hr className="my-4 "></hr>

            <div className="flex flex-col gap-3">
              <h1 className="text-primary font-semibold text-xl">
                Sua Avaliação
              </h1>
              <div>
                <h3 className="text-primary font-semibold">Nota:</h3>
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
                        className="text-primary -bold inline-flex ml-3 cursor-pointer"
                      />
                    </div>
                  )}
                />
              </div>
              <div>
                <h3 className="text-primary font-semibold">Comentário:</h3>
                <textarea
                  {...register("comment")}
                  className="rounded-sm border-2 w-full h-25 mt-2 px-3 py-2"
                  placeholder="Escreva sua opinião sobre o livro..."
                ></textarea>
              </div>
              <div>
                <h3 className="text-primary font-semibold">
                  Status da Leitura:
                </h3>
                <Controller
                  name="readingStatus"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full border-2 mt-2 border-secondary text-md py-5">
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                      <SelectContent className="border-secondary bg-background rounded-lg">
                        {Object.entries(readingStatusLabels).map(
                          ([statusKey, statusLabel]) => (
                            <SelectItem
                              key={statusKey}
                              value={statusKey}
                              className="cursor-pointer text-md p-3"
                            >
                              {statusLabel}{" "}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <Button
                type="submit"
                className="w-full mt-2 h-10"
                disabled={isPending}
              >
                {isPending ? "Salvando..." : "Salvar avaliação"}
              </Button>
            </div>
            <hr className="my-4 "></hr>
            <div>
              <h1 className="text-primary font-semibold text-xl mb-3">
                Todas as avaliações
              </h1>
              {book?.reviews?.map((r) => {
                const isAbandoned = r.readingStatus === READING_STATUS_DROPPED;
                return (
                  <Card
                    key={r.id}
                    className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 h-full bg-cream my-4"
                  >
                    <Avatar className="size-15 self-center">
                      {" "}
                      <AvatarImage
                        src={r.user.profilePicture || undefined}
                        alt="Foto de perfil"
                      />
                      <AvatarFallback
                        className="text-1xl font-semibold text-primary"
                        delayMs={600}
                      >
                        {getInitials(r.user.name || "")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <CardTitle>{r.user.nickname}</CardTitle>
                      {isAbandoned ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Abandonou a leitura deste livro.
                        </p>
                      ) : (
                        <h3 className="mt-1 text-sm text-muted-foreground">
                          {r.comment}
                        </h3>
                      )}
                    </div>

                    {!isAbandoned && (
                      <div className="shrink-0">
                        <Rating
                          initialValue={r.rating}
                          readonly
                          allowFraction
                          SVGstyle={{ display: "inline" }}
                          size={25}
                          fillColor="#be2c3f"
                          emptyColor="#e2cad0"
                        />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReviewDialog;
