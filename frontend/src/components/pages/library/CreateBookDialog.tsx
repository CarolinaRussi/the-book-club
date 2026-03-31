import { type ChangeEvent, useState, useEffect, useCallback } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/command";
import type {
  IBook,
  IBookPayload,
  IOpenLibraryBook,
} from "../../../types/IBooks";
import {
  fetchBooksFromMyDatabase,
  fetchBooksFromOpenLibrary,
} from "../../../api/queries/fetchBooks";
import { BookOpen, ChevronsUpDown, Lock, Upload } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IApiError } from "../../../types/IApi";
import { toast } from "react-toastify";
import { useClub } from "../../../contexts/ClubContext";
import { createBook } from "../../../api/mutations/bookMutate";
import { cn } from "../../../lib/utils";

interface CreateBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ICreateBookForm {
  title: string;
  author: string;
  coverImg?: FileList;
}

type SearchResultBook = {
  id: string;
  title: string;
  author: string[];
  cover?: string;
  coverLargeUrl?: string;
  cover_i?: number;
  source: "local" | "openLibrary";
};

const CreateBookDialog = ({ open, onOpenChange }: CreateBookDialogProps) => {
  const [selectedBook, setSelectedBook] = useState<SearchResultBook | null>(
    null,
  );
  const [inputValue, setInputValue] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>("");
  const { selectedClubId } = useClub();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ICreateBookForm>({
    defaultValues: {
      title: "",
      author: "",
      coverImg: undefined,
    },
  });

  const { data: searchResults, isError } = useQuery({
    queryKey: ["books", inputValue],
    enabled: !!inputValue,
    queryFn: async () => {
      const [localResponse, openLibResponse] = await Promise.all([
        fetchBooksFromMyDatabase(inputValue),
        fetchBooksFromOpenLibrary(inputValue),
      ]);

      const localBooks = localResponse.map((book: IBook) => ({
        id: book.id,
        title: book.title,
        author: book.author ? [book.author] : ["Autor desconhecido"],
        cover: book.coverUrl,
        source: "local",
      }));

      const externalBooks = (openLibResponse.docs || [])
        .filter((book: any) => book.cover_i && book.cover_i > 0)
        .map((book: IOpenLibraryBook) => {
          const id = book.cover_i!;
          const base = `https://covers.openlibrary.org/b/id/${id}`;
          return {
            id: book.key,
            title: book.title,
            author: book.author_name || ["Autor desconhecido"],
            cover: `${base}-S.jpg?default=false`,
            coverLargeUrl: `${base}-L.jpg?default=false`,
            cover_i: id,
            source: "openLibrary" as const,
          };
        });
      return [...localBooks, ...externalBooks] as SearchResultBook[];
    },
  });

  const { mutate: createBookMutate, isPending } = useMutation<
    any,
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
      clearManualForm();
      clearOpenLibrarySelection();
    },
    onError: (error) => {
      toast.error(error.message || "Dados do livro incorretos");
    },
  });

  const clearManualForm = useCallback(() => {
    reset();
    setPreviewUrl(undefined);
  }, [reset]);

  const clearOpenLibrarySelection = useCallback(() => {
    setSelectedBook(null);
    setInputValue("");
  }, []);

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        clearManualForm();
        clearOpenLibrarySelection();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [open, clearManualForm, clearOpenLibrarySelection]);

  const isLocalSelection = selectedBook?.source === "local";
  const isOpenLibrarySelection = selectedBook?.source === "openLibrary";

  const handleSelect = (book: SearchResultBook) => {
    setSelectedBook(book);
    setInputValue(book.title);
    setOpenCombobox(false);
    const authorStr = (book.author || ["Autor desconhecido"]).join(", ");
    reset({
      title: book.title,
      author: authorStr,
      coverImg: undefined,
    });
    setPreviewUrl(book.coverLargeUrl ?? book.cover ?? undefined);
  };

  const { onChange: rhfOnChange, ...restRegister } = register("coverImg");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isLocalSelection) return;
    rhfOnChange(event);
    const file = event.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit: SubmitHandler<ICreateBookForm> = (data) => {
    if (!selectedClubId) {
      toast.error("Você não pode adicionar um livro sem estar em um clube");
      return;
    }
    const title = data.title.trim();
    const author = data.author.trim();
    const { coverImg } = data;

    const openLibraryKey =
      selectedBook?.source === "openLibrary"
        ? selectedBook.id.split("/").pop()
        : undefined;
    const existingBookId =
      selectedBook?.source === "local" ? selectedBook.id : undefined;

    const payload: IBookPayload = {
      id: openLibraryKey ?? existingBookId ?? "",
      title,
      author,
      coverUrlOpenLibrary:
        selectedBook?.source === "openLibrary" &&
        selectedBook.coverLargeUrl &&
        !(coverImg && coverImg.length > 0)
          ? selectedBook.coverLargeUrl
          : undefined,
      coverImg: coverImg && coverImg.length > 0 ? coverImg : undefined,
      clubId: selectedClubId,
    };

    if (!payload.title || !payload.author) {
      toast.warn(
        "Por favor, preencha pelo menos o título e o autor, ou selecione um livro.",
      );
      return;
    }
    createBookMutate(payload);
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

          <div className="min-h-0 max-h-[min(70dvh,calc(100svh-14rem))] flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pr-1 [scrollbar-gutter:stable]">
            <h3 className="text-lg font-medium mt-3 mb-3">
              1. Pesquisar na OpenLibrary (biblioteca online)
            </h3>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between h-12 text-muted-foreground"
                >
                  {selectedBook ? (
                    <span className="text-foreground truncate">
                      {selectedBook.title}
                    </span>
                  ) : (
                    "Ex.: O Nome do Vento"
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                <Command
                  shouldFilter={false}
                  className="h-auto max-h-[min(380px,55svh)]"
                >
                  <CommandInput
                    placeholder="Digite o nome do livro..."
                    value={inputValue}
                    onValueChange={setInputValue}
                  />
                  <CommandList className="max-h-[min(300px,45svh)] min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                    <CommandEmpty>
                      {isError ? "Erro ao buscar." : "Nenhum livro encontrado."}
                    </CommandEmpty>

                    {searchResults && searchResults.length > 0 && (
                      <CommandGroup>
                        {searchResults.map((book: SearchResultBook) => (
                          <CommandItem
                            key={`${book.source}-${book.id}`}
                            value={`${book.title}-${book.id}`.toLowerCase()}
                            onSelect={() => handleSelect(book)}
                            className="flex items-center gap-3"
                          >
                            {book.cover ? (
                              <img
                                src={book.cover}
                                alt="capa"
                                className="h-12 w-9 object-cover rounded-sm"
                              />
                            ) : (
                              <div className="h-12 w-9 bg-secondary rounded-sm flex items-center justify-center">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}

                            <div className="flex flex-col overflow-hidden">
                              <div className="flex items-center gap-2">
                                <span className="truncate font-medium">
                                  {book.title}
                                </span>
                              </div>

                              <span className="text-xs text-muted-foreground truncate">
                                {book.author.join(", ")} ({book.source})
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="flex items-center m-4">
              <hr className="flex-1 border-t border-muted" />
              <span className="text-sm font-semibold text-muted-foreground">
                OU
              </span>
              <hr className="flex-1 border-t border-muted" />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-1">
                2. Dados do livro
              </h3>
              {isLocalSelection && (
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
              )}
              {isOpenLibrarySelection && (
                <p className="mb-3 text-sm text-muted-foreground">
                  Você pode ajustar título ou autor (por exemplo, traduzir o
                  nome). Para trocar a capa, envie uma imagem — ela substitui a
                  da Open Library.
                </p>
              )}
              {!selectedBook && (
                <p className="mb-3 text-sm text-muted-foreground">
                  Preencha os campos ou use a busca acima.
                </p>
              )}
              <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
                <div className="md:col-span-1 flex flex-col items-center gap-2">
                  {isLocalSelection ? (
                    <div className="relative flex max-h-48 min-h-40 w-full max-w-50 flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-muted bg-muted/80 sm:h-64 sm:max-h-none sm:w-50">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Capa do livro"
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
                      className="relative flex max-h-48 min-h-40 w-full max-w-50 cursor-pointer flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted hover:bg-muted/80 sm:h-64 sm:max-h-none sm:w-50"
                    >
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview da Capa"
                          className="h-full w-full object-cover rounded-lg"
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
                <div className="md:col-span-2 grid grid-cols-1 gap-4 content-start">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium mb-1.5 "
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
                      {...register("title", {
                        required: !selectedBook
                          ? "Título é obrigatório"
                          : false,
                      })}
                      placeholder="O Nome do Vento"
                    />
                    {errors.title && (
                      <h3 className="text-xs text-primary">
                        {errors.title.message}
                      </h3>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="author"
                      className="block text-sm font-medium mb-1.5"
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
                        required: !selectedBook
                          ? "Autor é obrigatório"
                          : false,
                      })}
                      placeholder="Patrick Rothfuss"
                    />
                    {errors.author && (
                      <h3 className="text-xs text-primary">
                        {errors.author.message}
                      </h3>
                    )}
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
};

export default CreateBookDialog;
