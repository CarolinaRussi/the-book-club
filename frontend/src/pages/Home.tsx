import { FaPlus } from "react-icons/fa6";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router";
import { MdOutlineEmail } from "react-icons/md";
import { useClub } from "../contexts/ClubContext";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userClubs } = useClub();
  // const handleLogin = () => {
  //   login("test-token", "test-user");
  //   navigate("/");
  // };

  const openModalCreateBookClube = () => {
    // Lógica para abrir o modal de criação do clube do livro
    console.log("Abrir modal de criação de clube do livro");
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-10 mt-5">
        <Card id="card-novo-clube" className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaPlus size={20} className="text-primary" />
              Criar novo clube
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Crie seu próprio clube do livro e convide amigos para participar
            </p>
          </CardContent>
          <CardFooter>
            <button
              onClick={() => openModalCreateBookClube()}
              className="mt-4 font-semibold py-3 w-full rounded-xl bg-primary text-background cursor-pointer hover:bg-primary/80"
            >
              Criar clube
            </button>
          </CardFooter>
        </Card>

        <Card id="card-biblioteca" className="w-full">
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
          <CardFooter>
            <button
              onClick={() => openModalCreateBookClube()}
              className="mt-4 font-semibold py-3 w-full rounded-xl bg-background border border-secondary shadow-md text-foreground hover:bg-cream hover:text-foreground cursor-pointer"
            >
              Inserir código
            </button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-10 mt-10">
        <Card id="card-meus-clubes" className="w-full mt-3">
          <CardHeader>
            <CardTitle className="text-2xl text-left">Seus Clubes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {userClubs.length > 0 ? (
              userClubs.map((club) => (
                <Card key={club.id} className="w-full">
                  <CardHeader className="pb-3">
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
                    <CardContent className="pt-0 pb-4">
                      <p className="text-sm text-muted-foreground">
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
    </div>
  );
}
