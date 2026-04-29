import { GiBookCover } from "react-icons/gi";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { TbBooks, TbCoffee } from "react-icons/tb";
import { Link } from "react-router";

export default function Index() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-12 pt-12 text-center sm:px-6 sm:pb-16 sm:pt-16 md:px-12 md:pb-20 md:pt-20 lg:px-20">
      <GiBookCover
        className="h-16 w-16 shrink-0 text-primary sm:h-20 sm:w-20 md:h-[100px] md:w-[100px]"
        aria-hidden
      />

      <h1 className="mt-5 max-w-[min(100%,36rem)] text-balance text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
        Bem-vindo ao Clube do Livro
      </h1>

      <h2 className="mt-4 max-w-2xl text-pretty text-base text-warm-brown sm:text-lg md:text-2xl">
        Conecte-se com outros leitores, compartilhe suas experiências literárias
        e descubra novos mundos através dos livros.
      </h2>

      <div className="mt-8 grid w-full grid-cols-1 gap-6 sm:gap-8 md:mt-10 md:grid-cols-3 md:gap-8 lg:gap-10">
        <div
          id="card-comunidade"
          className="flex min-h-[11rem] w-full max-w-sm flex-col items-center justify-center gap-2 rounded-lg border-2 border-secondary bg-background p-5 text-center text-foreground shadow-md sm:p-6 md:mx-0 md:mt-5 md:w-80 md:max-w-none md:justify-self-center"
        >
          <MdOutlinePeopleAlt className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" />
          <span className="text-2xl font-semibold sm:text-3xl">Comunidade</span>
          <p className="text-sm text-warm-brown sm:text-base">
            Conheça pessoas apaixonadas por leitura
          </p>
        </div>

        <div
          id="card-biblioteca"
          className="flex min-h-[11rem] w-full max-w-sm flex-col items-center justify-center gap-2 rounded-lg border-2 border-secondary bg-background p-5 text-center text-foreground shadow-md sm:p-6 md:mx-0 md:mt-5 md:w-80 md:max-w-none md:justify-self-center"
        >
          <TbBooks className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" />
          <span className="text-2xl font-semibold sm:text-3xl">Biblioteca</span>
          <p className="text-sm text-warm-brown sm:text-base">
            Mantenha registros de todos os livros lidos
          </p>
        </div>

        <div
          id="card-encontros"
          className="flex min-h-[11rem] w-full max-w-sm flex-col items-center justify-center gap-2 rounded-lg border-2 border-secondary bg-background p-5 text-center text-foreground shadow-md sm:p-6 md:mx-0 md:mt-5 md:w-80 md:max-w-none md:justify-self-center"
        >
          <TbCoffee className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" />
          <span className="text-2xl font-semibold sm:text-3xl">Encontros</span>
          <p className="text-sm text-warm-brown sm:text-base">
            Participe de discussões sobre os livros enquanto toma um café
          </p>
        </div>
      </div>

      <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-6">
        <Link
          to="/register"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground sm:w-auto"
        >
          Criar conta
        </Link>

        <Link
          to="/login"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-secondary px-6 py-3 font-semibold text-foreground sm:w-auto"
        >
          Entrar
        </Link>
      </div>
    </div>
  );
}
