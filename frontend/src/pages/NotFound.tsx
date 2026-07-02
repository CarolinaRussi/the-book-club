import { Link, useLocation, useNavigate } from "react-router";
import { GiBookCover } from "react-icons/gi";
import { TbArrowBackUp } from "react-icons/tb";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const homePath = user ? "/home" : "/";
  const homeLabel = user ? "Ir para a home" : "Voltar ao início";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-xl flex-col items-center justify-center px-4 py-12 text-center sm:py-16">
      <div className="relative w-full max-w-md rounded-lg border-2 border-secondary bg-background p-8 shadow-md sm:p-10">
        <GiBookCover
          className="mx-auto h-16 w-16 text-primary sm:h-20 sm:w-20"
          aria-hidden
        />

        <p
          className="mt-6 bg-clip-text text-7xl font-bold tracking-tight text-transparent sm:text-8xl"
          style={{ backgroundImage: "var(--gradient-warm)" }}
        >
          404
        </p>

        <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
          Página não encontrada
        </h1>

        <p className="mt-3 text-pretty text-base text-warm-brown sm:text-lg">
          Parece que este capítulo ainda não foi escrito — ou o marcador caiu em
          uma página que não existe.
        </p>

        {pathname !== "/" && (
          <p className="mt-4 break-all rounded-md border border-secondary/80 bg-muted/50 px-3 py-2 font-mono text-xs text-muted-foreground sm:text-sm">
            {pathname}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="rounded-xl">
            <Link to={homePath}>{homeLabel}</Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="rounded-xl"
            onClick={() => navigate(-1)}
          >
            <TbArrowBackUp className="size-5" aria-hidden />
            Página anterior
          </Button>
        </div>
      </div>
    </div>
  );
}
