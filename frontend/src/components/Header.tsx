import { GiBookshelf } from "react-icons/gi";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useClub } from "../contexts/ClubContext";
import { FiHome } from "react-icons/fi";
import { TbBooks, TbCoffee } from "react-icons/tb";
import { MdOutlineLogout, MdOutlinePeopleAlt } from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const privateNavItems = [
  { to: "/meetings", label: "Próximo Encontro", Icon: TbCoffee, size: 24 },
  { to: "/library", label: "Biblioteca", Icon: TbBooks, size: 24 },
  { to: "/readers", label: "Leitoras", Icon: MdOutlinePeopleAlt, size: 24 },
];

export default function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const { selectedClubId, setSelectedClubId, userClubs, isLoadingClubs } =
    useClub();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedClubId(event.target.value);
  }

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
            `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            }`
          }
        >
          <FiHome size={20} />
          Home
        </NavLink>

        {isLoggedIn && (
          <>
            {privateNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                  }`
                }
              >
                <item.Icon size={item.size} />
                {item.label}
              </NavLink>
            ))}

            {userClubs.length > 1 && (
              <Select
                value={selectedClubId || undefined}
                onValueChange={setSelectedClubId} // O shadcn já passa o (value: string)
                disabled={isLoadingClubs}
              >
                {/* Isso é o <select> (o botão que você vê)
        Você pode centralizar o texto aqui! 
      */}
                <SelectTrigger className="w-[200px] border-2 border-secondary justify-center">
                  <SelectValue placeholder="Carregando..." />
                </SelectTrigger>

                {/* Isso é o Menu de Opções
        AQUI VOCÊ PODE ARREDONDAR! 
      */}
                <SelectContent className="border-secondary bg-background rounded-lg">
                  {userClubs.map((userClub) => (
                    <SelectItem
                      key={userClub.id}
                      value={userClub.id}
                      className="cursor-pointer"
                    >
                      {userClub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <button
              onClick={handleLogout}
              className="font-semibold px-4 py-2 flex items-center gap-1 rounded-xl hover:bg-primary hover:text-background text-muted-foreground cursor-pointer"
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
