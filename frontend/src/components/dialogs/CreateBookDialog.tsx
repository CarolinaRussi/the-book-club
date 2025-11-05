import { ChangeEvent, FormEvent, useState } from "react";
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
import fetchBooks from "../../api/queries/fetchBooks";
import { BookOpen, ChevronsUpDown, Upload } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IApiError } from "../../types/IApi";
import { toast } from "react-toastify";
import { createBook } from "../../api/mutations/bookMutate";

interface CreateBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateBookDialog = ({ open, onOpenChange }: CreateBookDialogProps) => {
  const [selectedBook, setSelectedBook] = useState<IOpenLibraryBook | null>(
    null
  );
  const [inputValue, setInputValue] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);

  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthor, setManualAuthor] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>("");

  const { data: searchResults, isError } = useQuery({
    queryKey: ["books", inputValue],
    queryFn: () => fetchBooks(inputValue),
    enabled: !!inputValue,
  });

  const { mutate: createBookMutate } = useMutation<
    any,
    IApiError,
    IBookPayload
  >({
    mutationFn: createBook,
    onSuccess: async (result) => {
      //queryClient.invalidateQueries({ queryKey: ["book", result.book?.id] });
      //reset();
      console.log(result);
      onOpenChange(false);
      //setSelectedBookId(result.book.id);
      toast.success("Livro adicionado à biblioteca com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Dados do livro incorretos");
    },
  });

  const clearManualForm = () => {
    setManualTitle("");
    setManualAuthor("");
    setCoverFile(null);
    setPreviewUrl(undefined);
  };

  const clearOpenLibrarySelection = () => {
    setSelectedBook(null);
    setInputValue("");
  };

  const handleSelect = (book: IOpenLibraryBook) => {
    setSelectedBook(book);
    setInputValue(book.title);
    setOpenCombobox(false);
    clearManualForm();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      clearOpenLibrarySelection();
    }
  };

  const handleManualInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    setter(e.target.value);
    clearOpenLibrarySelection();
  };

  const handleSaveBook = () => {
    let payload: IBookPayload | null = null;

    if (selectedBook) {
      payload = {
        OpenLibraryId: selectedBook.key?.split("/").pop(),
        title: selectedBook.title,
        author: (selectedBook.author_name || ["Autor desconhecido"]).join(', '),
        coverUrl: selectedBook.cover_i
          ? `https://covers.openlibrary.org/b/id/${selectedBook.cover_i}-L.jpg`
          : undefined,
      };
    } else if (manualTitle && manualAuthor) {
      payload = {
        title: manualTitle,
        author: manualAuthor,
        coverImg: coverFile || undefined,
      };
    }

    if (payload) {
      console.log("Enviando para API (futuro mutate):", payload);
      createBookMutate(payload);
      onOpenChange(false);
    } else {
      console.warn("Nenhum livro selecionado ou formulário preenchido.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] lg:max-w-2xl">
        <DialogHeader className="gap-0">
          <DialogTitle className="text-3xl text-primary">
            Adicionar nova Leitura
          </DialogTitle>
          <DialogDescription className="text-1xl text-warm-brown">
            Pesquise na Open Library ou adicione manualmente.
          </DialogDescription>
        </DialogHeader>

        {/* --- Parte 1: Open Library --- */}
        <div>
          <h3 className="text-lg font-medium mb-3">
            1. Pesquisar na Open Library
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

        <div className="flex items-center gap-4">
          <hr className="flex-1 border-t border-muted" />
          <span className="text-sm font-semibold text-muted-foreground">
            OU
          </span>
          <hr className="flex-1 border-t border-muted" />
        </div>

        {/* --- Parte 2: Manual --- */}
        <div>
          <h3 className="text-lg font-medium mb-3">2. Adicionar Manualmente</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <p className="text-xs text-muted-foreground">PNG ou JPG</p>
                  </div>
                )}
                <input
                  id="cover-upload"
                  type="file"
                  className="hidden"
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
                  value={manualTitle}
                  onChange={(e) => handleManualInputChange(e, setManualTitle)}
                  placeholder="O Nome do Vento"
                />
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
                  value={manualAuthor}
                  onChange={(e) => handleManualInputChange(e, setManualAuthor)}
                  placeholder="Patrick Rothfuss"
                />
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
          <Button type="button" onClick={handleSaveBook}>
            Salvar Livro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBookDialog;
