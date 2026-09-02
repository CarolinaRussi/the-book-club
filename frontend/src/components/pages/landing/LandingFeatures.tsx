import LandingFeatureRow from "./LandingFeatureRow";

const features = [
  {
    title: "Biblioteca",
    description:
      "O acervo do clube num só lugar: o que já leram, o que está em andamento e o que vem pela frente, com quem sugeriu e o status de cada leitura.",
    imageAlt: "Captura de tela da biblioteca do clube no Entrelivros",
  },
  {
    title: "Encontros",
    description:
      "Marque datas, escolha o formato e registre o que rolou. O histórico do clube deixa de viver só na memória de quem organizou.",
    imageAlt: "Captura de tela dos encontros do clube no Entrelivros",
  },
  {
    title: "Sorteador",
    description:
      "Na hora de escolher o próximo livro, o sorteio fica justo e transparente, com a turma participando no mesmo espaço.",
    imageAlt: "Captura de tela do sorteador de leitura no Entrelivros",
  },
  {
    title: "Explorar",
    description:
      "Descubra clubes públicos perto de você no mapa e veja se encaixa na turma, sem precisar de indicação no escuro.",
    imageAlt: "Captura de tela do mapa Explorar no Entrelivros",
  },
] as const;

export default function LandingFeatures() {
  return (
    <section className="w-full px-4 py-12 sm:px-6 sm:py-16 md:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-balance text-2xl font-bold text-foreground sm:text-3xl">
          O que o clube ganha no Entrelivros
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-pretty text-base text-warm-brown sm:text-lg">
          Ferramentas pensadas pra quem já vive clube de leitura, não um feed
          genérico de livros.
        </p>

        <div className="mt-12 flex flex-col gap-14 sm:gap-16">
          {features.map((feature, index) => (
            <LandingFeatureRow
              key={feature.title}
              title={feature.title}
              description={feature.description}
              imageAlt={feature.imageAlt}
              reverse={index % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
