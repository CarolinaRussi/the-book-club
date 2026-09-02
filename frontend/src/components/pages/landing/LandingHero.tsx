import LogoEntrelivros from "@/components/LogoEntrelivros";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function LandingHero() {
  return (
    <section className="flex w-full flex-col items-center px-4 pt-3 text-center sm:px-6 sm:pt-4 md:px-10 lg:px-16">
      <LogoEntrelivros
        size={280}
        className="-mb-2 h-48 w-48 shrink-0 sm:-mb-3 sm:h-50 sm:w-50 lg:-mb-3 lg:h-70 lg:w-70"
        aria-hidden
      />

      <p className="mt-1 text-sm font-medium tracking-wide text-primary sm:mt-2">
        Entrelivros
      </p>

      <h1 className="mt-2 max-w-[min(100%,36rem)] text-balance text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
        O lugar do seu clube de leitura
      </h1>

      <p className="mt-3 max-w-2xl text-pretty text-base text-warm-brown sm:text-lg md:text-xl">
        Leituras, encontros e memórias num só lugar: sem planilha, sem sumiço no
        WhatsApp.
      </p>

      <div className="mt-6 flex w-full max-w-md flex-col gap-2.5 sm:flex-row sm:justify-center sm:gap-4 md:max-w-lg">
        <Button asChild size="lg" className="w-full rounded-xl sm:w-auto sm:min-w-36">
          <Link to="/register">Criar conta</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="w-full rounded-xl sm:w-auto sm:min-w-36"
        >
          <Link to="/login">Entrar</Link>
        </Button>
      </div>
    </section>
  );
}
