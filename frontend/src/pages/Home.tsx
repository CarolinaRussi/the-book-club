import { FaPlus } from "react-icons/fa6";
import { useAuth } from "../contexts/AuthContext";
import { MdOutlineEmail } from "react-icons/md";
import { useClub } from "../contexts/ClubContext";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import CreateClubDialog from "../components/dialogs/CreateClubDialog";
import { ChangeEvent, useState } from "react";
import { IBook } from "../types/IBooks";
import ConfirmClubDialog from "../components/dialogs/ConfirmClubDialog";

export default function Home() {
  const { user } = useAuth();
  const { clubs } = useClub();
  const [createClubOpen, setCreateClubOpen] = useState(false);
  const [clubCode, setClubCode] = useState("");
  const [isConfirmingClub, setConfirmingClub] = useState(false);

  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setClubCode(e.target.value.toUpperCase());
  };

  const actualBook: IBook = {
    id: "1",
    name: "O nome do vento (A Crônica do Matador do Rei - Livro 1)",
    author: "Patrick Rothfuss",
    createdAt: "2025-11-02T02:42:39.623Z",
    image_url: "https://m.media-amazon.com/images/I/81CGmkRG9GL._SL1500_.jpg",
    reviews: [
      {
        id: "1",
        userId: "2",
        rating: 2.5,
        review: "não fede nem cheira",
      },
      {
        id: "2",
        userId: "1",
        rating: 4,
        review: "gostei muito!",
      },
    ],
  };

  return (
    <div className="flex flex-col w-full max-w-7xl">
      <div id="boas-vindas" className="flex flex-col items-start">
        <h1 className="text-5xl font-bold text-foreground ">
          Olá, {user?.nickname || "Bem-vindo ao Clube do Livro"}
        </h1>

        <h3 className="text-2xl mt-3 w-full text-muted-foreground">
          O que você gostaria de fazer hoje?
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-10 mt-5">
        <Card className="w-full gap-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaPlus size={24} className="text-primary" />
              Criar novo clube
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Crie seu próprio clube do livro e convide amigos para participar
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="mt-6 font-semibold text-1xl py-6 w-full rounded-xl bg-primary text-background cursor-pointer hover:bg-primary/80"
              onClick={() => setCreateClubOpen(true)}
            >
              Criar Clube
            </Button>
          </CardFooter>
        </Card>
        <Card className="w-full gap-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdOutlineEmail size={24} className="text-primary" />
              Entrar em um clube
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Recebeu um convite? Digite o código para entrar em um clube
            </p>
          </CardContent>
          <CardFooter className="mt-6 grid grid-cols-3">
            <input
              className="col-span-2 border border-secondary p-3 mr-2 shadow-md rounded-xl "
              placeholder="Ex.: SUPERCLUBE2000"
              value={clubCode}
              onChange={handleCodeChange}
            />
            <Button
              className="col-span-1 font-semibold text-1xl py-6 rounded-xl bg-background border border-secondary shadow-md text-foreground hover:bg-cream hover:text-foreground cursor-pointer"
              onClick={() => setConfirmingClub(true)}
              disabled={clubCode.length === 0}
            >
              Inserir código
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* <BookCard actualBook={actualBook} /> */}

      <div className="grid grid-cols-1 gap-10 mt-5">
        <Card id="card-meus-clubes" className="w-full mt-3 gap-2">
          <CardHeader>
            <CardTitle className="text-2xl text-left">Seus Clubes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {clubs.length > 0 ? (
              clubs.map((club) => (
                <Card key={club.id} className="w-full gap-0 ">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-semibold text-primary">
                      {club.name}
                      {club.owner_id === user?.id ? (
                        <Badge className="ml-2">Admin</Badge>
                      ) : (
                        <Badge variant="secondary" className="ml-2">
                          Membro
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  {club.description && (
                    <CardContent className="pt-0 pb-2">
                      <p className="text-md text-muted-foreground">
                        {club.description}
                      </p>
                    </CardContent>
                  )}
                  <CardFooter className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      Criado em:{" "}
                      {new Date(club.created_at).toLocaleDateString()}
                    </span>
                    <Badge
                      variant={
                        club.status === "active" ? "default" : "secondary"
                      }
                    >
                      {club.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">
                Você ainda não faz parte de nenhum clube. Crie um ou use um
                código de convite!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <CreateClubDialog
        open={createClubOpen}
        onOpenChange={setCreateClubOpen}
      />
      <ConfirmClubDialog
        invitationCode={clubCode}
        open={isConfirmingClub}
        onOpenChange={setConfirmingClub}
        onSuccess={() => setClubCode("")}
      />
    </div>
  );
}
