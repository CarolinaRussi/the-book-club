import { Link, useNavigate, useRouteError } from "react-router";
import LogoEntrelivros from "@/components/LogoEntrelivros";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "Algo deu errado ao carregar esta página.";
}

export default function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();
  const { user } = useAuth();

  const homePath = user ? "/home" : "/";
  const homeLabel = user ? "Ir para a home" : "Voltar ao início";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-xl flex-col items-center justify-center px-4 py-12 text-center sm:py-16">
      <div className="relative w-full max-w-md rounded-lg border-2 border-secondary bg-background p-8 shadow-md sm:p-10">
        <LogoEntrelivros size={180} className="mx-auto" aria-hidden />

        <h1 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl">
          Ops, deu um problema
        </h1>

        <p className="mt-3 text-pretty text-base text-warm-brown sm:text-lg">
          A página travou por um instante. Tente de novo — na maioria das vezes
          isso resolve.
        </p>

        {import.meta.env.DEV ? (
          <p className="mt-4 break-words rounded-md border border-secondary/80 bg-muted/50 px-3 py-2 text-left font-mono text-xs text-muted-foreground sm:text-sm">
            {errorMessage(error)}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            type="button"
            size="lg"
            className="rounded-xl"
            onClick={() => window.location.reload()}
          >
            Tentar de novo
          </Button>

          <Button asChild variant="outline" size="lg" className="rounded-xl">
            <Link to={homePath}>{homeLabel}</Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="rounded-xl"
            onClick={() => navigate(-1)}
          >
            Página anterior
          </Button>
        </div>
      </div>
    </div>
  );
}
