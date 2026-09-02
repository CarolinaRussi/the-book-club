import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function LandingFinalCta() {
  return (
    <section className="w-full px-4 py-12 sm:px-6 sm:py-16 md:px-10 lg:px-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-2xl font-bold text-foreground sm:text-3xl">
          Pronto pra dar casa ao seu clube?
        </h2>
        <p className="mt-3 text-pretty text-base text-warm-brown sm:text-lg">
          Crie sua conta e comece a organizar leituras, encontros e memórias no
          Entrelivros.
        </p>

        <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center sm:gap-4">
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

        <p className="mt-8 text-sm text-muted-foreground">
          <Link
            to="/privacidade"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Política de privacidade
          </Link>
        </p>
      </div>
    </section>
  );
}
