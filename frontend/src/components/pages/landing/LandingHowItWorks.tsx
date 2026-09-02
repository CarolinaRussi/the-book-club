const steps = [
  {
    number: "1",
    title: "Crie ou entre no clube",
    description:
      "Monte o seu espaço ou aceite um convite. Em minutos o clube já tem casa.",
  },
  {
    number: "2",
    title: "Organize leituras e encontros",
    description:
      "Defina o livro da vez, marque a data e acompanhe quem está lendo junto.",
  },
  {
    number: "3",
    title: "Guarde a memória do clube",
    description:
      "Histórico de livros, encontros e registros ficam no mesmo lugar, prontos pra voltar.",
  },
] as const;

export default function LandingHowItWorks() {
  return (
    <section className="w-full bg-background/60 px-4 py-12 sm:px-6 sm:py-16 md:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-balance text-2xl font-bold text-foreground sm:text-3xl">
          Como funciona
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-pretty text-base text-warm-brown sm:text-lg">
          Três passos para o clube sair do caos e ganhar um lugar só dele.
        </p>

        <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {steps.map((step) => (
            <li key={step.number} className="flex flex-col items-center text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {step.number}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-warm-brown sm:text-base">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
