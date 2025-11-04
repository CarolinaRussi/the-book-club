import { GiBookshelf } from "react-icons/gi";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useClub } from "../contexts/ClubContext";
import { FiHome } from "react-icons/fi";
import { TbBooks, TbCoffee } from "react-icons/tb";
import {
  MdOutlineLogout,
  MdOutlinePeopleAlt,
  MdOutlinePerson,
} from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { FiMenu } from "react-icons/fi";
import { useState } from "react";

const privateNavItems = [
  { to: "/meetings", label: "Próximo Encontro", Icon: TbCoffee, size: 24 },
  { to: "/library", label: "Biblioteca", Icon: TbBooks, size: 24 },
  { to: "/readers", label: "Leitores", Icon: MdOutlinePeopleAlt, size: 24 },
  { to: "/profile", label: "Perfil", Icon: MdOutlinePerson, size: 24 },
];

export default function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const { selectedClubId, setSelectedClubId, clubs, isLoadingClubs } =
    useClub();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const NavLinks = ({ isMobile = false }) => (
    <>
      <NavLink
        to={isLoggedIn ? "/home" : "/"}
        className={({ isActive }) =>
          `flex items-center gap-2 ${
            isMobile ? "px-4 py-3 text-lg" : "px-4 py-2 text-sm"
          } rounded-md font-medium transition-all ${
            isActive
              ? "bg-primary text-cream shadow-sm"
              : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
          }`
        }
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
      >
        <FiHome size={isMobile ? 24 : 20} />
        Home
      </NavLink>

      {isLoggedIn &&
        privateNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 ${
                isMobile ? "px-4 py-3 text-lg" : "px-4 py-2 text-sm"
              } rounded-md font-medium transition-all ${
                isActive
                  ? "bg-primary text-cream shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              }`
            }
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
          >
            <item.Icon size={item.size} />
            {item.label}
          </NavLink>
        ))}
    </>
  );

  return (
    <header className="bg-background p-4 flex flex-row justify-between items-center shadow-md relative z-10">
      <div
        className="flex flex-row items-center gap-2 cursor-pointer"
        onClick={() => navigate(isLoggedIn ? "/home" : "/")}
      >
        <GiBookshelf size={32} className="text-primary" />
        {isLoggedIn && (
          <>
            {clubs.length > 0 && (
              <Select
                value={selectedClubId || undefined}
                onValueChange={(value) => {
                  setSelectedClubId(value);
                  setIsMobileMenuOpen(false);
                }}
                disabled={isLoadingClubs}
              >
                <SelectTrigger className="w-full border-2 ml-2 border-secondary justify-center text-lg py-6">
                  <SelectValue placeholder="Carregando..." />
                </SelectTrigger>
                <SelectContent className="border-secondary bg-background rounded-lg">
                  {clubs.map((club) => (
                    <SelectItem
                      key={club.id}
                      value={club.id}
                      className="cursor-pointer text-lg p-3"
                    >
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </>
        )}
      </div>

      <div className="hidden md:flex flex-row items-center gap-2">
        <NavLinks />
        {isLoggedIn && (
          <>
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

      <div className="md:hidden">
        {isLoggedIn && (
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="text-foreground p-2">
                <FiMenu size={28} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background w-[80vw]">
              <SheetHeader className="mb-4 text-left">
                <SheetTitle className="text-primary text-2xl">Menu</SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-3">
                <NavLinks isMobile={true} />

                <button
                  onClick={handleLogout}
                  className="px-4 py-3 text-lg font-semibold w-full flex items-center gap-2 rounded-xl text-destructive cursor-pointer hover:bg-destructive/10"
                >
                  <MdOutlineLogout size={24} />
                  Sair
                </button>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
}
