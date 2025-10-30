import { FaPlus } from "react-icons/fa6";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router";
import { MdOutlineEmail } from "react-icons/md";
import { useClub } from "../contexts/ClubContext";
import { Badge } from "../components/ui/badge";

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
    <div className="flex flex-col w-full max-w-5xl">
      <div id="boas-vindas" className="flex flex-col items-start">
        <h1 className="text-5xl font-bold text-foreground ">
          Olá, {user?.nickname || "Bem-vindo ao Clube do Livro"}
        </h1>

        <h3 className="text-2xl mt-3 w-full text-muted-foreground">
          O que você gostaria de fazer hoje?
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-10 mt-5">
        <div
          id="card-novo-clube"
          className="border-2 text-foreground border-secondary rounded-lg p-6 w-full shadow-md bg-background flex flex-col items-start justify-start gap-2 text-center"
        >
          <div className="flex flex-row gap-2 items-center mb-2">
            <FaPlus size={20} className="text-primary" />
            <h1 className="text-2xl font-semibold">Criar novo clube</h1>
          </div>
          <h3 className="text-muted-foreground text-left">
            Crie seu próprio clube do livro e convide amigos para participar
          </h3>
          <button
            onClick={() => openModalCreateBookClube()}
            className="mt-4 font-semibold py-3 w-full rounded-xl bg-primary text-background cursor-pointer hover:bg-primary/80"
          >
            Criar clube
          </button>
        </div>

        <div
          id="card-biblioteca"
          className="border-2 text-foreground border-secondary rounded-lg p-6 w-full shadow-md bg-background flex flex-col items-start justify-start gap-2 text-center"
        >
          <div className="flex flex-row gap-2 items-center mb-2">
            <MdOutlineEmail size={24} className="text-primary" />
            <h1 className="text-2xl font-semibold">Entrar em um clube</h1>
          </div>
          <h3 className="text-muted-foreground text-left">
            Recebeu um convite? Digite o código para entrar em um clube
          </h3>
          <button
            onClick={() => openModalCreateBookClube()}
            className="mt-4 font-semibold py-3 w-full rounded-xl bg-background border border-secondary shadow-md text-foreground hover:bg-cream hover:text-foreground cursor-pointer"
          >
            Inserir código
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-10 mt-10">
        <div
          id="card-meus-clubes"
          className="border-2 border-secondary rounded-lg p-7 w-full min-h-40 mt-3 shadow-md bg-cream flex flex-col gap-2 text-center"
        >
          <h1 className="text-2xl ml-2 font-bold text-left text-warm-brown">
            Seus Clubes
          </h1>
          <div className="items-center mt-1 justify-center text-warm-brown">
            {userClubs.length > 0 ? (
              <div>
                {userClubs.map((club) => (
                  <div className="border-2 border-secondary rounded-lg bg-background p-5 w-full min-h-20 mt-5 shadow-md flex flex-col gap-2 text-start">
                    <div className="text-xl text-primary font-semibold">
                      {club.name}
                      {club.owner_id === user?.id ? (
                        <Badge className="ml-2 py-1">Admin</Badge>
                      ) : (
                        <Badge className="ml-2 py-1 bg-warm-brown">
                          Membro
                        </Badge>
                      )}
                    </div>
                    {club.description && (
                      <div className="text-sm text-muted-foreground">
                        {club.description}
                      </div>
                    )}
                    <div className="flex flex-row gap-4 justify-between">
                      <div className="text-sm text-muted-foreground">
                        Criado em:{" "}
                        {new Date(club.created_at).toLocaleDateString()}
                      </div>
                      <Badge className="bg-teal-700">
                        {club.status == "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <h3>
                Você ainda não faz parte de nenhum clube. Crie um ou use um
                código de convite!
              </h3>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
