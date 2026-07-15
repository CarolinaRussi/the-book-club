import LogoEntrelivros from "@/components/LogoEntrelivros";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { TbBooks, TbCoffee } from "react-icons/tb";
import { Link } from "react-router";

const featureCardClassName =
  "mx-auto flex w-full max-w-md flex-col items-center justify-center gap-1 rounded-lg border-2 border-secondary bg-background px-4 py-3 text-center text-foreground shadow-md sm:px-5 sm:py-4 lg:mx-0 lg:max-w-none";

export default function Index() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-6 pt-3 text-center sm:px-6 sm:pb-8 sm:pt-4 md:px-10 lg:px-16 xl:px-20">
      <LogoEntrelivros
        size={280}
        className="-mb-2 h-48 w-48 shrink-0 sm:-mb-3 sm:h-50 sm:w-50 lg:-mb-3 lg:h-70 lg:w-70"
        aria-hidden
      />

      <h1 className="mt-1 max-w-[min(100%,36rem)] text-balance text-3xl font-bold leading-tight text-foreground sm:mt-2 sm:text-4xl lg:text-5xl">
        Bem-vindo ao Entrelivros
      </h1>

      <h2 className="mt-2 max-w-2xl text-pretty text-base text-warm-brown sm:text-lg md:text-xl lg:text-xl">
        Conecte-se com outros leitores, compartilhe suas experiências literárias
        e descubra novos mundos através dos livros.
      </h2>

      <div className="mt-4 grid w-full grid-cols-1 justify-items-center gap-3 sm:gap-4 lg:mt-5 lg:grid-cols-3 lg:justify-items-stretch lg:gap-5">
        <div id="card-comunidade" className={featureCardClassName}>
          <MdOutlinePeopleAlt className="h-8 w-8 shrink-0 sm:h-10 sm:w-10" />
          <span className="text-xl font-semibold sm:text-2xl">Comunidade</span>
          <p className="text-sm text-warm-brown">
            Conheça pessoas apaixonadas por leitura
          </p>
        </div>

        <div id="card-biblioteca" className={featureCardClassName}>
          <TbBooks className="h-8 w-8 shrink-0 sm:h-10 sm:w-10" />
          <span className="text-xl font-semibold sm:text-2xl">Biblioteca</span>
          <p className="text-sm text-warm-brown">
            Mantenha registros de todos os livros lidos
          </p>
        </div>

        <div id="card-encontros" className={featureCardClassName}>
          <TbCoffee className="h-8 w-8 shrink-0 sm:h-10 sm:w-10" />
          <span className="text-xl font-semibold sm:text-2xl">Encontros</span>
          <p className="text-sm text-warm-brown">
            Participe de discussões sobre os livros enquanto toma um café
          </p>
        </div>
      </div>

      <div className="mt-5 flex w-full max-w-md flex-col gap-2.5 sm:mt-6 sm:flex-row sm:justify-center sm:gap-4 md:max-w-lg">
        <Link
          to="/register"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-2.5 font-semibold text-primary-foreground sm:w-auto sm:min-w-36"
        >
          Criar conta
        </Link>

        <Link
          to="/login"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-secondary px-6 py-2.5 font-semibold text-foreground sm:w-auto sm:min-w-36"
        >
          Entrar
        </Link>
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link
          to="/privacidade"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Política de privacidade
        </Link>
      </p>
    </div>
  );
}
