import { FaPlus } from "react-icons/fa6";
import { TbBooks } from "react-icons/tb";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router";
import { MdOutlineEmail } from "react-icons/md";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // const handleLogin = () => {
  //   login("test-token", "test-user");
  //   navigate("/");
  // };

  const openModalCreateBookClube = () => {
    // Lógica para abrir o modal de criação do clube do livro
    console.log("Abrir modal de criação de clube do livro");
  };

  return (
    <div className="bg-background flex flex-col items-center justify-start gap-4 min-h-screen p-20">
      <div className="flex flex-col w-full max-w-5xl">
        <div id="boas-vindas" className="flex flex-col items-start">
          <h1 className="text-5xl mt-5 font-bold text-foreground ">
            Olá, {user?.nickname || "Bem-vindo ao Clube do Livro"}
          </h1>

          <h3 className="text-2xl mt-3 w-full text-muted-foreground">
            O que você gostaria de fazer hoje?
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-10 mt-5">
          <div
            id="card-novo-clube"
            className="border-2 text-foreground border-secondary rounded-lg p-6 w-full mt-5 shadow-md bg-background flex flex-col items-start justify-start gap-2 text-center"
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
            className="border-2 text-foreground border-secondary rounded-lg p-6 w-full mt-5 shadow-md bg-background flex flex-col items-start justify-start gap-2 text-center"
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
              className="mt-4 font-semibold py-3 w-full rounded-xl bg-primary text-background cursor-pointer hover:bg-primary/80"
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
            <h1 className="text-2xl ml-2 font-bold text-left text-foreground">
              Seus Clubes
            </h1>
            <div className="items-center mt-3 justify-center text-warm-brown">
              <h3>
                Você ainda não faz parte de nenhum clube. Crie um ou use um
                código de convite!
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
