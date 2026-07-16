import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useClub } from "../contexts/ClubContext";
import HeaderClubSwitcher from "./HeaderClubSwitcher";
import { openFeedbackDialog } from "./FeedbackWidget";
import { FiHome, FiMenu } from "react-icons/fi";
import { TbBooks, TbCoffee } from "react-icons/tb";
import {
  MdOutlineLogout,
  MdOutlinePeopleAlt,
  MdOutlinePerson,
  MdOutlineSettings,
} from "react-icons/md";
import { Compass, MessageSquarePlus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { useMemo, useState, type ComponentType } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
  requiresClub: boolean;
  requiresClubAdmin: boolean;
  iconOnlyOnDesktop?: boolean;
};

const generalNavItems: NavItem[] = [
  {
    to: "/home",
    label: "Página inicial",
    Icon: FiHome,
    requiresClub: false,
    requiresClubAdmin: false,
  },
  {
    to: "/explorar",
    label: "Explorar",
    Icon: Compass,
    requiresClub: false,
    requiresClubAdmin: false,
  },
  {
    to: "/me",
    label: "Perfil",
    Icon: MdOutlinePerson,
    requiresClub: false,
    requiresClubAdmin: false,
  },
];

const clubNavItems: NavItem[] = [
  {
    to: "/meetings",
    label: "Encontros",
    Icon: TbCoffee,
    requiresClub: true,
    requiresClubAdmin: false,
  },
  {
    to: "/library",
    label: "Biblioteca",
    Icon: TbBooks,
    requiresClub: true,
    requiresClubAdmin: false,
  },
  {
    to: "/readers",
    label: "Leitores",
    Icon: MdOutlinePeopleAlt,
    requiresClub: true,
    requiresClubAdmin: false,
  },
  {
    to: "/club/manage",
    label: "Gerenciar",
    Icon: MdOutlineSettings,
    requiresClub: true,
    requiresClubAdmin: true,
  },
];

function navLinkClassName(isActive: boolean, isMobile: boolean) {
  return cn(
    "flex items-center gap-2 rounded-md font-medium transition-all",
    isMobile ? "px-4 py-3 text-lg" : "px-4 py-2 text-sm",
    isActive
      ? "bg-primary text-cream shadow-sm"
      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
  );
}

export default function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();
  const { clubs, selectedClubId } = useClub();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const hasClubs = clubs.length > 0;

  const filteredClubNavItems = useMemo(() => {
    const selectedClub = clubs.find((club) => club.id === selectedClubId);
    const isAdminOfSelectedClub = !!(
      user &&
      selectedClub &&
      selectedClub.ownerId === user.id
    );

    return clubNavItems.filter((item) => {
      if (item.requiresClub && !hasClubs) return false;
      if (item.requiresClubAdmin && !isAdminOfSelectedClub) return false;
      return true;
    });
  }, [clubs, selectedClubId, user, hasClubs]);

  const handleLogout = () => {
    logout();
    navigate("/");
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const renderNavItem = (item: NavItem, isMobile = false) => {
    const iconOnly = !isMobile && item.iconOnlyOnDesktop;

    return (
      <NavLink
        key={item.to}
        to={item.to}
        aria-label={iconOnly ? item.label : undefined}
        title={iconOnly ? item.label : undefined}
        className={({ isActive }) =>
          cn(
            navLinkClassName(isActive, isMobile),
            iconOnly && "justify-center px-2.5",
          )
        }
        onClick={() => isMobile && closeMobileMenu()}
      >
        <item.Icon size={isMobile ? 24 : 20} />
        {iconOnly ? null : item.label}
      </NavLink>
    );
  };

  if (!isLoggedIn) {
    return (
      <header className="relative z-10 flex flex-row items-center justify-between bg-background p-4 shadow-md">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="shrink-0 cursor-pointer text-xl font-bold text-primary transition-opacity hover:opacity-80"
        >
          Entrelivros
        </button>
        <NavLink
          to="/"
          className={({ isActive }) => navLinkClassName(isActive, false)}
        >
          <FiHome size={20} />
          Home
        </NavLink>
      </header>
    );
  }

  return (
    <header className="relative z-10 bg-background p-4 shadow-md">
      <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-3">
        <nav className="flex shrink-0 flex-row items-center justify-start gap-1">
          {generalNavItems.map((item) => renderNavItem(item))}
        </nav>

        <div className="flex min-w-0 flex-1 flex-row items-center justify-end gap-1 overflow-hidden">
          {hasClubs ? (
            <div className="mr-1 min-w-0 max-w-44 shrink xl:max-w-56">
              <HeaderClubSwitcher align="end" />
            </div>
          ) : null}
          {filteredClubNavItems.map((item) => renderNavItem(item))}
          <button
            type="button"
            onClick={handleLogout}
            title="Sair"
            aria-label="Sair"
            className="flex shrink-0 cursor-pointer items-center gap-1 rounded-xl px-2.5 py-2 font-semibold text-muted-foreground hover:bg-primary hover:text-background xl:gap-1 xl:px-4"
          >
            <MdOutlineLogout size={22} />
            <span className="hidden xl:inline">Sair</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="shrink-0 cursor-pointer text-xl font-bold text-primary transition-opacity hover:opacity-80"
        >
          Entrelivros
        </button>

        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="p-2 text-foreground"
              aria-label="Abrir menu"
            >
              <FiMenu size={28} />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80vw] bg-background">
            <SheetHeader className="mb-4 text-left">
              <SheetTitle className="text-2xl text-primary">Menu</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-3">
              {generalNavItems.map((item) => renderNavItem(item, true))}

              {hasClubs ? (
                <div className="border-t border-border px-4 py-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Clube ativo
                  </p>
                  <HeaderClubSwitcher align="start" />
                </div>
              ) : null}

              {filteredClubNavItems.map((item) => renderNavItem(item, true))}

              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  window.setTimeout(() => openFeedbackDialog(), 150);
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-4 py-3 text-lg font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              >
                <MessageSquarePlus size={24} />
                Feedback
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-4 py-3 text-lg font-semibold text-destructive hover:bg-destructive/10"
              >
                <MdOutlineLogout size={24} />
                Sair
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
