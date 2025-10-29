import { GiBookshelf } from "react-icons/gi";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { FiHome } from "react-icons/fi";
import { TbBooks, TbCoffee } from "react-icons/tb";
import { MdOutlineLogout, MdOutlinePeopleAlt } from "react-icons/md";

export default function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-background p-4 flex flex-row justify-between items-center shadow-md relative z-10">
      <div className="flex flex-row items-center gap-2">
        <GiBookshelf size={32} className="text-primary" />
        <h1 className="text-2xl font-bold text-primary">Entre linhas</h1>
      </div>
      <div className="flex flex-row items-center gap-2">
        <NavLink
          to={isLoggedIn ? "/home" : "/"}
          className={({ isActive }) =>
            `font-semibold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-primary hover:text-background ${
              isActive ? "bg-primary text-background" : "text-foreground"
            }`
          }
        >
          <FiHome size={20} />
          Home
        </NavLink>

        {isLoggedIn && (
          <>
            <NavLink
              to="/meetings"
              className={({
                isActive,
              }) => `font-semibold px-4 py-2 flex items-center gap-1 rounded-xl hover:bg-primary hover:text-background cursor-pointer
               ${isActive ? "bg-primary text-background" : "text-foreground"}`}
            >
              <TbCoffee size={24} />
              Próximo Encontro
            </NavLink>
            <NavLink
              to="/library"
              className={({
                isActive,
              }) => `font-semibold px-4 py-2 flex items-center gap-1 rounded-xl hover:bg-primary hover:text-background cursor-pointer
               ${isActive ? "bg-primary text-background" : "text-foreground"}`}
            >
              <TbBooks size={24} />
              Biblioteca
            </NavLink>
            <NavLink
              to="/readers"
              className={({
                isActive,
              }) => `font-semibold px-4 py-2 flex items-center gap-1 rounded-xl hover:bg-primary hover:text-background cursor-pointer
               ${isActive ? "bg-primary text-background" : "text-foreground"}`}
            >
              <MdOutlinePeopleAlt size={24} />
              Leitoras
            </NavLink>
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
