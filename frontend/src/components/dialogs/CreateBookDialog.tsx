import { ChangeEvent, useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { IBookPayload, IOpenLibraryBook } from "../../types/IBooks";
import { fetchBooksFromOpenLibrary } from "../../api/queries/fetchBooks";
import { BookOpen, ChevronsUpDown, Upload } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IApiError } from "../../types/IApi";
import { toast } from "react-toastify";
import { useClub } from "../../contexts/ClubContext";
import { createBook } from "../../api/mutations/bookMutate";

interface CreateBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ICreateBookForm {
  title: string;
  author: string;
  coverImg?: FileList;
}

const CreateBookDialog = ({ open, onOpenChange }: CreateBookDialogProps) => {
  const [selectedBook, setSelectedBook] = useState<IOpenLibraryBook | null>(
    null
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
    watch,
    reset,
  } = useForm<ICreateBookForm>({
    defaultValues: {
      title: "",
      author: "",
      coverImg: undefined,
    },
  });

  const watchedTitle = watch("title");
  const watchedAuthor = watch("author");

  const { data: searchResults, isError } = useQuery({
    queryKey: ["books", inputValue],
    queryFn: () => fetchBooksFromOpenLibrary(inputValue),
    enabled: !!inputValue,
  });

  const { mutate: createBookMutate, isPending } = useMutation<
    any,
    IApiError,
    IBookPayload
  >({
    mutationFn: createBook,
    onSuccess: async (result) => {
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

  const clearManualForm = () => {
    reset();
    setPreviewUrl(undefined);
  };

  const clearOpenLibrarySelection = () => {
    setSelectedBook(null);
    setInputValue("");
  };

  useEffect(() => {
    if (watchedTitle || watchedAuthor) {
      if (selectedBook) {
        clearOpenLibrarySelection();
      }
    }
  }, [watchedTitle, watchedAuthor, selectedBook]);

  const handleSelect = (book: IOpenLibraryBook) => {
    setSelectedBook(book);
    setInputValue(book.title);
    setOpenCombobox(false);
    clearManualForm();
  };

  const { onChange: rhfOnChange, ...restRegister } = register("coverImg");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    rhfOnChange(event);
    const file = event.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      clearOpenLibrarySelection();
    }
  };

  const onSubmit: SubmitHandler<ICreateBookForm> = (data) => {
    if (!selectedClubId) {
      toast.error("Você não pode adicionar um livro sem estar em um clube");
      return;
    }
    const { title: manualTitle, author: manualAuthor, coverImg } = data;

    const payload: IBookPayload = {
      openLibraryId: selectedBook?.key?.split("/").pop(),
      title: selectedBook ? selectedBook.title : manualTitle,
      author: selectedBook
        ? (selectedBook.author_name || ["Autor desconhecido"]).join(", ")
        : manualAuthor,
      coverUrl: selectedBook?.cover_i
        ? `https://covers.openlibrary.org/b/id/${selectedBook.cover_i}-L.jpg`
        : undefined,
      coverImg: coverImg && coverImg.length > 0 ? coverImg : undefined,
      clubId: selectedClubId,
    };

    if (!payload.title || !payload.author) {
      toast.warn(
        "Por favor, preencha pelo menos o título e o autor, ou selecione um livro."
      );
      return;
    }
    createBookMutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] lg:max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader className="gap-0">
            <DialogTitle className="text-3xl text-primary">
              Adicionar nova Leitura
            </DialogTitle>
            <DialogDescription className="text-1xl text-warm-brown">
              Pesquise na Open Library ou adicione manualmente.
            </DialogDescription>
          </DialogHeader>

          <div>
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
                <Command>
                  <CommandInput
                    placeholder="Digite o nome do livro..."
                    value={inputValue}
                    onValueChange={setInputValue}
                  />

                  <CommandEmpty>
                    {isError ? "Erro ao buscar." : "Nenhum livro encontrado."}
                  </CommandEmpty>

                  {searchResults && searchResults.docs.length > 0 && (
                    <CommandGroup>
                      {searchResults.docs.map((book: IOpenLibraryBook) => (
                        <CommandItem
                          key={book.key}
                          value={book.title}
                          onSelect={() => handleSelect(book)}
                          className="flex items-center gap-3"
                        >
                          {book.cover_i ? (
                            <img
                              src={`https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`}
                              alt="capa"
                              className="h-12 w-9 object-cover rounded-sm"
                            />
                          ) : (
                            <div className="h-12 w-9 bg-secondary rounded-sm flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex flex-col overflow-hidden">
                            <span className="truncate">{book.title}</span>
                            <span className="text-xs text-muted-foreground truncate">
                              {book.author_name}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center m-4">
            <hr className="flex-1 border-t border-muted" />
            <span className="text-sm font-semibold text-muted-foreground">
              OU
            </span>
            <hr className="flex-1 border-t border-muted" />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">
              2. Adicionar Manualmente
            </h3>
            <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
              <div className="md:col-span-1 flex flex-col items-center gap-2">
                <label
                  htmlFor="cover-upload"
                  className="relative flex flex-col items-center justify-center w-50 h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview da Capa"
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                      <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
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
                    className="w-full border border-secondary p-3 mr-2 shadow-md rounded-xl"
                    {...register("title", {
                      required: !selectedBook ? "Título é obrigatório" : false,
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
                    className="w-full border border-secondary p-3 mr-2 shadow-md rounded-xl "
                    {...register("author", {
                      required: !selectedBook ? "Autor é obrigatório" : false,
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

          <DialogFooter className=" mt-5 ">
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
