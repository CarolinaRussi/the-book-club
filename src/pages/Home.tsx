import { GiBookCover } from "react-icons/gi";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { TbBooks, TbCoffee } from "react-icons/tb";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = () => {
    login("test-token", "test-user");
    navigate("/");
  };
  return (
    <div className="bg-background flex flex-col items-center justify-start gap-4 min-h-screen p-20">
      <GiBookCover size={100} className="text-foreground" />
      <h1 className="text-5xl mt-5 font-bold text-foreground">
        Bem-vindo ao Clube do Livro
      </h1>

      <h3 className="text-2xl w-200 text-warm-brown text-center">
        Conecte-se com outros leitores, compartilhe suas experiências literárias
        e descubra novos mundos através dos livros.
      </h3>

      <div className="grid grid-cols-3 gap-10 mt-10">
        <div
          id="card-comunidade"
          className="border-2 text-foreground border-secondary rounded-lg p-6 w-80 h-50 mt-5 shadow-md bg-background flex flex-col items-center justify-center gap-2 text-center"
        >
          <MdOutlinePeopleAlt size={48} />
          <h1 className="text-3xl font-semibold">Comunidade</h1>
          <h3 className="text-warm-brown">
            Conheça pessoas apaixonadas por leitura
          </h3>
        </div>

        <div
          id="card-biblioteca"
          className="border-2 text-foreground border-secondary rounded-lg p-6 w-80 h-50 mt-5 shadow-md bg-background flex flex-col items-center justify-center gap-2 text-center"
        >
          <TbBooks size={48} />
          <h1 className="text-3xl font-semibold">Biblioteca</h1>
          <h3 className="text-warm-brown">
            Mantenha registros de todos os livros lidos
          </h3>
        </div>

        <div
          id="card-encontros"
          className="border-2 text-foreground border-secondary rounded-lg p-6 w-80 h-50 mt-5 shadow-md bg-background flex flex-col items-center justify-center gap-2 text-center"
        >
          <TbCoffee size={48} />
          <h1 className="text-3xl font-semibold">Encontros</h1>
          <h3 className="text-warm-brown">
            Participe de discussões sobre os livros enquanto toma um café
          </h3>
        </div>
      </div>
      <div className="flex flex-row gap-6 mt-5">
        <button
          className={`font-semibold px-8 py-3 rounded-xl flex items-center gap-2 bg-primary text-background  cursor-pointer `}
          onClick={() => handleLogin()}
        >
          Criar conta
        </button>

        <button
          className={`font-semibold px-6 py-3 rounded-xl flex items-center gap-2 text-foreground border border-secondary cursor-pointer `}
          onClick={() => handleLogin()}
        >
          Entrar
        </button>
      </div>
    </div>
  );
}
