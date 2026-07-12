import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useClub } from "../contexts/ClubContext";
import HeaderClubSwitcher from "./HeaderClubSwitcher";
import { FiHome } from "react-icons/fi";
import { TbBooks, TbCoffee } from "react-icons/tb";
import {
  MdOutlineLogout,
  MdOutlinePeopleAlt,
  MdOutlinePerson,
  MdOutlineSettings,
} from "react-icons/md";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { FiMenu } from "react-icons/fi";
import { useMemo, useState } from "react";

const privateNavItems = [
  {
    to: "/meetings",
    label: "Próximo Encontro",
    Icon: TbCoffee,
    size: 24,
    requiresClub: true,
    requiresClubAdmin: false,
  },
  {
    to: "/library",
    label: "Biblioteca",
    Icon: TbBooks,
    size: 24,
    requiresClub: true,
    requiresClubAdmin: false,
  },
  {
    to: "/readers",
    label: "Leitores",
    Icon: MdOutlinePeopleAlt,
    size: 24,
    requiresClub: true,
    requiresClubAdmin: false,
  },
  {
    to: "/club/manage",
    label: "Gerenciar clube",
    Icon: MdOutlineSettings,
    size: 24,
    requiresClub: true,
    requiresClubAdmin: true,
  },
  {
    to: "/me",
    label: "Perfil",
    Icon: MdOutlinePerson,
    size: 24,
    requiresClub: false,
    requiresClubAdmin: false,
  },
];

export default function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();
  const { clubs, selectedClubId } = useClub();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredNavItems = useMemo(() => {
    const hasClubs = clubs && clubs.length > 0;
    const selectedClub = clubs.find((club) => club.id === selectedClubId);
    const isAdminOfSelectedClub = !!(
      user &&
      selectedClub &&
      selectedClub.ownerId === user.id
    );

    return privateNavItems.filter((item) => {
      if (item.requiresClub && !hasClubs) return false;
      if (item.requiresClubAdmin && !isAdminOfSelectedClub) return false;
      return true;
    });
  }, [clubs, selectedClubId, user]);

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
        filteredNavItems.map((item) => (
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
      <div className="flex min-w-0 flex-row items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(isLoggedIn ? "/home" : "/")}
          className={
            isLoggedIn && clubs.length > 0
              ? "shrink-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
              : "shrink-0 text-xl font-bold text-primary transition-opacity hover:opacity-80 cursor-pointer"
          }
        >
          Entrelivros
        </button>
        {isLoggedIn && clubs.length > 0 && (
          <>
            <span className="shrink-0 text-muted-foreground" aria-hidden>
              ·
            </span>
            <HeaderClubSwitcher />
          </>
        )}
      </div>

      <div className="hidden md:flex flex-row items-center gap-2">
        <NavLinks />
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="font-semibold px-4 py-2 flex items-center gap-1 rounded-xl hover:bg-primary hover:text-background text-muted-foreground cursor-pointer"
          >
            <MdOutlineLogout size={24} />
            Sair
          </button>
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
