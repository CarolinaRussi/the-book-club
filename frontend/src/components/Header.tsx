import { GiBookshelf } from "react-icons/gi";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useClub } from "../contexts/ClubContext";
import { FiHome } from "react-icons/fi";
import { TbBooks, TbCoffee } from "react-icons/tb";
import { MdOutlineLogout, MdOutlinePeopleAlt } from "react-icons/md";

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
              <select
                value={selectedClubId || ""}
                disabled={isLoadingClubs}
                onChange={handleChange}
                className="items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all border-2 border-secondary bg-background text-foreground cursor-pointer"
              >
                {isLoadingClubs && <option>Carregando clubes...</option>}

                {userClubs.map((userClub) => (
                  <option key={userClub.id} value={userClub.id}>
                    {userClub.name}
                  </option>
                ))}
              </select>
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
