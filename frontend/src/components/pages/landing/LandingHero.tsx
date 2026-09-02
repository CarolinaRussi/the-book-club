import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import LogoEntrelivros from "@/components/LogoEntrelivros";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LandingHero() {
  const navigate = useNavigate();
  const [inviteCodeOpen, setInviteCodeOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const handleInviteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = inviteCode.trim();
    if (!code) return;
    navigate(`/convite/${encodeURIComponent(code)}`);
  };

  return (
    <section className="w-full">
      <div className="mx-auto flex min-h-[min(72vh,34rem)] w-full max-w-6xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-14 md:px-10 lg:px-16">
        <LogoEntrelivros
          size={320}
          className="h-52 w-52 shrink-0 sm:h-56 sm:w-56 lg:h-72 lg:w-72"
          aria-hidden
        />

        <p className="mt-1 text-lg font-bold tracking-[0.2em] text-primary uppercase sm:mt-2 sm:text-xl lg:text-2xl">
          Entrelivros
        </p>

        <div
          aria-hidden
          className="mt-4 h-px w-16 bg-gradient-to-r from-transparent via-primary/45 to-transparent sm:w-20"
        />

        <h1 className="mt-4 whitespace-nowrap text-2xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
          O lugar do seu clube de leitura
        </h1>

        <p className="mt-3 max-w-2xl text-pretty text-base text-warm-brown sm:text-lg md:text-xl">
          Leituras, encontros e memórias num só lugar: sem planilha, sem sumiço no
          WhatsApp.
        </p>

        <div className="mt-7 flex w-full max-w-md flex-col gap-2.5 sm:flex-row sm:justify-center sm:gap-4 md:max-w-lg">
          <Button asChild size="lg" className="w-full rounded-xl sm:w-auto sm:min-w-36">
            <Link to="/register">Criar conta</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full rounded-xl border-secondary bg-background/80 backdrop-blur-sm sm:w-auto sm:min-w-36"
          >
            <Link to="/login">Entrar</Link>
          </Button>
        </div>

        <div className="mt-5 w-full max-w-sm">
          {!inviteCodeOpen ? (
            <button
              type="button"
              onClick={() => setInviteCodeOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-primary underline underline-offset-4 transition-colors hover:bg-primary/10 hover:text-primary/90"
            >
              Tenho um código
            </button>
          ) : (
            <form
              onSubmit={handleInviteSubmit}
              className="flex flex-col gap-2 sm:flex-row sm:items-center"
            >
              <Input
                value={inviteCode}
                onChange={(event) =>
                  setInviteCode(event.target.value.toUpperCase())
                }
                placeholder="Código de convite"
                aria-label="Código de convite"
                autoFocus
                className="rounded-xl border-secondary bg-background/80 text-center tracking-wide sm:text-left"
              />
              <Button
                type="submit"
                variant="secondary"
                className="shrink-0 rounded-xl"
                disabled={inviteCode.trim().length === 0}
              >
                Continuar
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
