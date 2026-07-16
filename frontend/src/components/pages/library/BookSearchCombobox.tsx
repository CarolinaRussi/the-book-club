import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronsUpDown, LoaderCircle } from "lucide-react";
import {
  fetchBooksFromMyDatabase,
  fetchBooksFromOpenLibrary,
} from "@/api/queries/fetchBooks";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { IBook, IOpenLibraryBook } from "@/types/IBooks";

export type SearchResultBook = {
  id: string;
  title: string;
  author: string[];
  cover?: string;
  coverLargeUrl?: string;
  cover_i?: number;
  source: "local" | "openLibrary";
};

type BookSearchComboboxProps = {
  selectedBook: SearchResultBook | null;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (book: SearchResultBook) => void;
};

export function BookSearchCombobox({
  selectedBook,
  inputValue,
  onInputValueChange,
  open,
  onOpenChange,
  onSelect,
}: BookSearchComboboxProps) {
  const searchQuery = inputValue.trim();
  const hasSearchQuery = searchQuery.length > 0;

  const {
    data: searchResults = [],
    isFetching: isSearching,
    isError: isSearchError,
  } = useQuery({
    queryKey: ["books", searchQuery],
    enabled: hasSearchQuery,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const [localResponse, openLibResponse] = await Promise.all([
        fetchBooksFromMyDatabase(searchQuery),
        fetchBooksFromOpenLibrary(searchQuery),
      ]);

      const localBooks = localResponse.map((book: IBook) => ({
        id: book.id,
        title: book.title,
        author: book.author ? [book.author] : ["Autor desconhecido"],
        cover: book.coverUrl,
        source: "local" as const,
      }));

      const externalBooks = (openLibResponse.docs || [])
        .filter(
          (book: IOpenLibraryBook) =>
            book.key && book.cover_i && book.cover_i > 0,
        )
        .map((book: IOpenLibraryBook) => {
          const coverId = book.cover_i!;
          const base = `https://covers.openlibrary.org/b/id/${coverId}`;
          return {
            id: book.key!,
            title: book.title,
            author: book.author_name || ["Autor desconhecido"],
            cover: `${base}-S.jpg?default=false`,
            coverLargeUrl: `${base}-L.jpg?default=false`,
            cover_i: coverId,
            source: "openLibrary" as const,
          };
        });

      return [...localBooks, ...externalBooks] as SearchResultBook[];
    },
  });

  const emptySearchMessage = !hasSearchQuery
    ? "Digite o nome do livro para buscar."
    : isSearchError
      ? "Erro ao buscar."
      : "Nenhum livro encontrado.";

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-12 w-full justify-between text-muted-foreground"
        >
          {selectedBook ? (
            <span className="truncate text-foreground">
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
            onValueChange={onInputValueChange}
          />
          <CommandList
            className="max-h-[min(300px,45svh)] min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
            onWheel={(event) => event.stopPropagation()}
          >
            <CommandEmpty>
              {isSearching ? (
                <span className="flex items-center justify-center gap-2">
                  <LoaderCircle className="size-4 animate-spin" />
                  Buscando livros...
                </span>
              ) : (
                emptySearchMessage
              )}
            </CommandEmpty>

            {searchResults.length > 0 ? (
              <CommandGroup>
                {searchResults.map((book) => (
                  <CommandItem
                    key={`${book.source}-${book.id}`}
                    value={`${book.title}-${book.id}`.toLowerCase()}
                    onSelect={() => onSelect(book)}
                    className="flex items-center gap-3"
                  >
                    {book.cover ? (
                      <img
                        src={book.cover}
                        alt="capa"
                        referrerPolicy="no-referrer"
                        className="h-12 w-9 rounded-sm object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-9 items-center justify-center rounded-sm bg-secondary">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate font-medium">{book.title}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {book.author.join(", ")} ({book.source})
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
