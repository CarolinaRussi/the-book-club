import { type ChangeEvent, useLayoutEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Lock, Upload } from "lucide-react";
import { toast } from "react-toastify";
import { createBook } from "@/api/mutations/bookMutate";
import {
  BookSearchCombobox,
  type SearchResultBook,
} from "@/components/pages/library/BookSearchCombobox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useClub } from "@/contexts/ClubContext";
import { cn } from "@/lib/utils";
import type { IApiError } from "@/types/IApi";
import type { IBookPayload } from "@/types/IBooks";

type CreateBookDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type CreateBookForm = {
  title: string;
  author: string;
  totalChapters?: number;
  coverImg?: FileList;
};

export default function CreateBookDialog({
  open,
  onOpenChange,
}: CreateBookDialogProps) {
  const [selectedBook, setSelectedBook] = useState<SearchResultBook | null>(
    null,
  );
  const [inputValue, setInputValue] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [fileInputKey, setFileInputKey] = useState(0);
  const { selectedClubId } = useClub();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateBookForm>({
    defaultValues: {
      title: "",
      author: "",
      totalChapters: undefined,
      coverImg: undefined,
    },
  });

  const { mutate: createBookMutate, isPending } = useMutation<
    unknown,
    IApiError,
    IBookPayload
  >({
    mutationFn: createBook,
    onSuccess: async () => {
      onOpenChange(false);
      queryClient.invalidateQueries({
        queryKey: ["booksFromSelectedClub", selectedClubId],
      });
      toast.success("Livro adicionado à biblioteca com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Dados do livro incorretos");
    },
  });

  useLayoutEffect(() => {
    if (!open) return;
    reset({
      title: "",
      author: "",
      totalChapters: undefined,
      coverImg: undefined,
    });
    setSelectedBook(null);
    setInputValue("");
    setPreviewUrl(undefined);
    setOpenCombobox(false);
    setFileInputKey((key) => key + 1);
  }, [open, reset]);

  const isLocalSelection = selectedBook?.source === "local";
  const isOpenLibrarySelection = selectedBook?.source === "openLibrary";

  const handleSelect = (book: SearchResultBook) => {
    setSelectedBook(book);
    setInputValue(book.title);
    setOpenCombobox(false);
    reset({
      title: book.title,
      author: (book.author || ["Autor desconhecido"]).join(", "),
      coverImg: undefined,
    });
    setPreviewUrl(book.coverLargeUrl ?? book.cover ?? undefined);
  };

  const { onChange: rhfOnChange, ...restRegister } = register("coverImg");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isLocalSelection) return;
    rhfOnChange(event);
    const file = event.target.files?.[0];
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const onSubmit: SubmitHandler<CreateBookForm> = (data) => {
    if (!selectedClubId) {
      toast.error("Você não pode adicionar um livro sem estar em um clube");
      return;
    }

    const openLibraryKey =
      selectedBook?.source === "openLibrary"
        ? selectedBook.id.split("/").pop()
        : undefined;
    const existingBookId =
      selectedBook?.source === "local" ? selectedBook.id : undefined;
    const hasUpload = Boolean(data.coverImg && data.coverImg.length > 0);

    createBookMutate({
      id: openLibraryKey ?? existingBookId ?? "",
      title: data.title.trim(),
      author: data.author.trim(),
      coverUrlOpenLibrary:
        selectedBook?.source === "openLibrary" &&
        selectedBook.coverLargeUrl &&
        !hasUpload
          ? selectedBook.coverLargeUrl
          : undefined,
      coverImg: hasUpload ? data.coverImg : undefined,
      totalChapters:
        data.totalChapters != null &&
        Number.isInteger(data.totalChapters) &&
        data.totalChapters > 0
          ? data.totalChapters
          : undefined,
      clubId: selectedClubId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90dvh,100svh)] min-h-0 w-full max-w-[calc(100vw-2rem)] flex-col gap-4 overflow-hidden p-6 sm:max-w-[425px] lg:max-w-2xl">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden"
        >
          <DialogHeader className="shrink-0 gap-0 pr-8">
            <DialogTitle className="line-clamp-2 text-balance text-left text-2xl text-primary sm:text-3xl">
              Adicionar nova Leitura
            </DialogTitle>
            <DialogDescription className="text-1xl text-warm-brown">
              Pesquise na Open Library ou adicione manualmente.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 max-h-[min(70dvh,calc(100svh-14rem))] flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable]">
            <h3 className="mt-3 mb-3 text-lg font-medium">
              1. Pesquisar na OpenLibrary (biblioteca online)
            </h3>
            <BookSearchCombobox
              selectedBook={selectedBook}
              inputValue={inputValue}
              onInputValueChange={setInputValue}
              open={openCombobox}
              onOpenChange={setOpenCombobox}
              onSelect={handleSelect}
            />

            <div className="m-4 flex items-center">
              <hr className="flex-1 border-t border-muted" />
              <span className="text-sm font-semibold text-muted-foreground">
                OU
              </span>
              <hr className="flex-1 border-t border-muted" />
            </div>

            <div>
              <h3 className="mb-1 text-lg font-medium">2. Dados do livro</h3>
              {isLocalSelection ? (
                <p className="mb-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <Lock
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span>
                    Este livro já está na base do sistema. Os dados abaixo são
                    só para conferência; ao salvar, ele será vinculado ao clube.
                  </span>
                </p>
              ) : null}
              {isOpenLibrarySelection ? (
                <p className="mb-3 text-sm text-muted-foreground">
                  Você pode ajustar título ou autor (por exemplo, traduzir o
                  nome). Para trocar a capa, envie uma imagem — ela substitui a
                  da Open Library.
                </p>
              ) : null}
              {!selectedBook ? (
                <p className="mb-3 text-sm text-muted-foreground">
                  Preencha os campos ou use a busca acima.
                </p>
              ) : null}

              <div className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
                <div className="flex flex-col items-center gap-2 md:col-span-1">
                  {isLocalSelection ? (
                    <div className="relative flex max-h-48 min-h-40 w-full max-w-50 flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-muted bg-muted/80 sm:h-64 sm:max-h-none sm:w-50">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Capa do livro"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
                          <BookOpen className="mb-2 size-8 opacity-60" />
                          <span className="text-xs">Sem capa</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <label
                      htmlFor="cover-upload"
                      className="relative flex max-h-48 min-h-40 w-full max-w-50 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted hover:bg-muted/80 sm:h-64 sm:max-h-none sm:w-50"
                    >
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview da Capa"
                          referrerPolicy="no-referrer"
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center px-2 pt-5 pb-6 text-center">
                          <Upload className="mb-4 size-8 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">
                              Clique para enviar a capa
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG ou JPG
                          </p>
                        </div>
                      )}
                      <input
                        key={fileInputKey}
                        id="cover-upload"
                        type="file"
                        className="hidden"
                        {...restRegister}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg"
                      />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-1 content-start gap-4 md:col-span-2">
                  <div>
                    <label
                      htmlFor="title"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Título
                    </label>
                    <input
                      id="title"
                      type="text"
                      readOnly={isLocalSelection}
                      className={cn(
                        "w-full rounded-xl border border-secondary p-3 shadow-md",
                        isLocalSelection &&
                          "cursor-default bg-muted/60 text-foreground",
                      )}
                      {...register("title", { required: "Título é obrigatório" })}
                      placeholder="O Nome do Vento"
                    />
                    {errors.title ? (
                      <p className="text-xs text-primary">
                        {errors.title.message}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="author"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Autor
                    </label>
                    <input
                      id="author"
                      type="text"
                      readOnly={isLocalSelection}
                      className={cn(
                        "w-full rounded-xl border border-secondary p-3 shadow-md",
                        isLocalSelection &&
                          "cursor-default bg-muted/60 text-foreground",
                      )}
                      {...register("author", {
                        required: "Autor é obrigatório",
                      })}
                      placeholder="Patrick Rothfuss"
                    />
                    {errors.author ? (
                      <p className="text-xs text-primary">
                        {errors.author.message}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="totalChapters"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Total de capítulos (opcional)
                    </label>
                    <input
                      id="totalChapters"
                      type="number"
                      min={1}
                      className="w-full rounded-xl border border-secondary p-3 shadow-md"
                      {...register("totalChapters", { valueAsNumber: true })}
                      placeholder="Ex.: 24"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-0 shrink-0 border-t border-border/60 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar Livro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
