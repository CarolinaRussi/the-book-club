import { IBook } from "../../types/IBooks";
import { getInitials } from "../../utils/formatters";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function BookCard({ actualBook }: { actualBook: IBook }) {
  return (
    <div className="grid grid-cols-1 gap-10 mt-10">
      {actualBook ? (
        <Card id="card-meus-livros" className="w-full mt-3 gap-1">
          <CardHeader>
            <CardTitle className="text-2xl text-left">
              Leituras em andamento:
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Card className="flex flex-row gap-3 p-5">
              <div className="shrink-0">
                {actualBook.cover_url ? (
                  <img
                    src={actualBook.cover_url}
                    alt="Capa do Livro"
                    className="h-70 object-cover rounded-2xl"
                  />
                ) : (
                  <div className="flex h-70 w-32 items-center justify-center rounded-2xl bg-muted">
                    <span className="text-4xl text-primary">
                      {getInitials(actualBook.title || "")}
                    </span>
                  </div>
                )}
              </div>
              <div className="h-70 flex-1 flex flex-col">
                <div className="flex flex-row justify-between">
                  <div className="text-2xl font-semibold text-primary">
                    {actualBook.title}
                  </div>
                  <Badge>Mundo Fantástico</Badge>
                </div>
                <div className="text-warm-brown">
                  <b>Autor: </b>
                  {actualBook.author}
                </div>
              </div>
            </Card>
          </CardContent>
        </Card>
      ) : (
        <p className="text-muted-foreground">
          Seu clube não escolheu um livro para ler.... ainda!
        </p>
      )}
    </div>
  );
}
