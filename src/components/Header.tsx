import { useState } from "react";
import { GiBookshelf } from "react-icons/gi";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { FiHome } from "react-icons/fi";
import { TbBooks, TbCoffee } from "react-icons/tb";
import { MdOutlineLogout, MdOutlinePeopleAlt } from "react-icons/md";

export default function Header() {
  const [botaoAtivo, setBotaoAtivo] = useState("Home");
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  const handleButtonClick = (buttonName: string, routePath: string) => {
    setBotaoAtivo(buttonName);
    navigate(routePath);
  };

  const handleLogout = () => {
    logout();
    setBotaoAtivo("Home");
    navigate("/");
  };

  return (
    <header className="bg-background p-4 flex flex-row justify-between items-center shadow-md relative z-10">
      <div className="flex flex-row items-center gap-2">
        <GiBookshelf size={32} className="text-primary" />
        <h1 className="text-2xl font-bold text-primary">Entre linhas</h1>
      </div>
      <div className="flex flex-row items-center gap-2">
        <button
          className={`font-semibold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary hover:text-background cursor-pointer ${
            botaoAtivo === "Home"
              ? "bg-primary text-background"
              : "text-foreground"
          }`}
          onClick={() => handleButtonClick("Home", "/")}
        >
          <FiHome size={20} />
          Home
        </button>

        {isLoggedIn && (
          <>
            <button
              className={`font-semibold px-4 py-2 flex items-center gap-1 rounded-xl hover:bg-primary hover:text-background cursor-pointer ${
                botaoAtivo === "Próximo Encontro"
                  ? "bg-primary text-background"
                  : "text-foreground"
              }`}
              onClick={() => handleButtonClick("Próximo Encontro", "/meetings")}
            >
              <TbCoffee size={24} />
              Próximo Encontro
            </button>
            <button
              className={`font-semibold px-4 py-2 flex items-center gap-1 rounded-xl hover:bg-primary hover:text-background cursor-pointer ${
                botaoAtivo === "Biblioteca"
                  ? "bg-primary text-background"
                  : "text-foreground"
              }`}
              onClick={() => handleButtonClick("Biblioteca", "/library")}
            >
              <TbBooks size={24} />
              Biblioteca
            </button>
            <button
              className={`font-semibold px-4 py-2 flex items-center gap-1 rounded-xl hover:bg-primary hover:text-background cursor-pointer ${
                botaoAtivo === "Leitoras"
                  ? "bg-primary text-background"
                  : "text-foreground"
              }`}
              onClick={() => handleButtonClick("Leitoras", "/readers")}
            >
              <MdOutlinePeopleAlt size={24} />
              Leitoras
            </button>
            <button
              onClick={handleLogout}
              className="font-semibold px-4 py-2 flex items-center gap-1 rounded-xl hover:bg-primary hover:text-background text-foreground cursor-pointer"
            >
              <MdOutlineLogout size={24} />
              Sair
            </button>
          </>
        )}
      </div>
    </header>
  );
}
