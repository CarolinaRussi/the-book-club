import { Link } from "react-router";

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-foreground sm:px-6 sm:py-14">
      <p className="text-sm text-muted-foreground">
        Última atualização: julho de 2026
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
        Política de privacidade
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        O <strong className="text-foreground">Entrelivros</strong> (
        <strong className="text-foreground">entrelivros.com</strong>) é uma
        plataforma para organização de clubes de leitura, encontros e
        interações entre leitoras. Esta política descreve que dados pessoais
        tratamos, para quê e com que base, incluindo a integração opcional ao{" "}
        <strong className="text-foreground">Google Calendar</strong>.
      </p>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          1. Responsável pelo tratamento
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          Os dados pessoais tratados através desta aplicação são da
          responsabilidade da titular do projeto Entrelivros (entrelivros.com).
          Para questões sobre privacidade ou exercício de direitos,
          utilize o{" "}
          <strong className="text-foreground">
            e-mail de contato do programador
          </strong>{" "}
          indicado na{" "}
          <strong className="text-foreground">
            Tela de consentimento OAuth
          </strong>{" "}
          do Google Cloud (campo de contato do programador), de forma a
          centralizar pedidos neste canal.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          2. Que dados recolhemos
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted-foreground">
          <li>
            <strong className="text-foreground">Conta e autenticação:</strong>{" "}
            nome, apelido, e-mail, senha (armazenada de forma
            segura), biografia opcional, gêneros favoritos, foto de perfil
            opcional e estado da conta.
          </li>
          <li>
            <strong className="text-foreground">Clubes e atividade:</strong>{" "}
            dados que introduz sobre clubes (nome, descrição, modo de leitura,
            convites), livros, encontros (data, hora, local, descrição, livro em
            discussão, estado) e participação como membro.
          </li>
          <li>
            <strong className="text-foreground">Arquivos:</strong> se enviar
            imagem de perfil ou outros arquivos permitidos pela app, estes são
            tratados para exibição no serviço (por exemplo, armazenamento em
            serviço de hospedagem de arquivos configurado pela aplicação).
          </li>
          <li>
            <strong className="text-foreground">Google Calendar (opcional):</strong>{" "}
            se optar por conectar a sua conta Google, tratamos tokens OAuth
            necessários para criar e atualizar eventos de calendário em nome da
            sua conta, conforme a seção 4.
          </li>
          <li>
            <strong className="text-foreground">Feedback do produto:</strong> se
            enviar uma mensagem pelo botão de feedback (disponível quando está
            autenticada), tratamos o tipo escolhido (bug, ideia ou outro), o
            texto da mensagem, a URL da página em que se encontrava e a
            identificação da sua conta, para melhorar o serviço.
          </li>
        </ul>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          3. Finalidades e bases legais
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          Tratamos os dados para prestar o serviço (criar sessão, mostrar perfil,
          gerir clubes e encontros), melhorar o produto com base em feedback
          voluntário, melhorar a segurança da conta e cumprir obrigações legais
          aplicáveis. A conexão ao Google Calendar assenta no{" "}
          <strong className="text-foreground">consentimento</strong>, que pode
          retirar a qualquer momento na área de perfil da aplicação e revogando o
          acesso na sua Conta Google.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          4. Google Calendar e permissões
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          Se conectar-se ao Google Calendar, a aplicação solicita permissões limitadas
          ao necessário para criar, atualizar ou remover{" "}
          <strong className="text-foreground">eventos de calendário</strong>{" "}
          associados a encontros que organiza, e para ler o endereço de e-mail da
          conta Google usada nessa ligação (para identificação). Os convites a
          encontros podem ser enviados por e-mail aos membros do clube através do
          serviço Google Calendar, conforme as opções dessa plataforma.
        </p>
        <p className="text-base leading-relaxed text-muted-foreground">
          Os tokens de atualização (refresh) são guardados no{" "}
          <strong className="text-foreground">servidor</strong> da aplicação,
          de forma protegida, e não são expostos no site público nem partilhados
          com outros utilizadores da aplicação. Não acedemos ao conteúdo dos
          seus e-mails nem a contactos fora do descrito acima.
        </p>
        <p className="text-base leading-relaxed text-muted-foreground">
          Permissões solicitadas ao Google:{" "}
          <strong className="text-foreground">
            criar, editar e eliminar eventos de calendário
          </strong>{" "}
          (<code className="text-sm">calendar.events</code>) e{" "}
          <strong className="text-foreground">ler o endereço de e-mail</strong>{" "}
          da conta Google ligada (<code className="text-sm">userinfo.email</code>
          ), apenas para identificar qual conta está conectada.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          5. Proteção de dados sensíveis
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          Aplicamos as seguintes medidas técnicas e organizativas aos dados
          sensíveis tratados pela aplicação, incluindo tokens OAuth do Google e
          credenciais de conta:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted-foreground">
          <li>
            <strong className="text-foreground">Encriptação em trânsito:</strong>{" "}
            toda a comunicação entre o browser, a API e serviços externos
            (incluindo Google OAuth e Google Calendar API) utiliza{" "}
            <strong className="text-foreground">HTTPS/TLS</strong>.
          </li>
          <li>
            <strong className="text-foreground">Encriptação em repouso:</strong>{" "}
            os refresh tokens OAuth do Google são encriptados com{" "}
            <strong className="text-foreground">AES-256-GCM</strong> antes de
            serem persistidos na base de dados; a chave de encriptação reside
            apenas no servidor da aplicação e não é exposta ao cliente.
          </li>
          <li>
            <strong className="text-foreground">Controlo de acesso:</strong>{" "}
            tokens Google e dados de calendário associados a uma conta só são
            acedidos no contexto da sessão autenticada dessa utilizadora;
            outros utilizadores da plataforma não têm acesso a esses dados.
          </li>
          <li>
            <strong className="text-foreground">Senhas:</strong> armazenadas com
            função de hash unidirecional (bcrypt), nunca em texto plano.
          </li>
          <li>
            <strong className="text-foreground">Minimização e finalidade:</strong>{" "}
            os tokens Google servem exclusivamente para sincronizar eventos de
            encontros criados na aplicação com o Google Calendar da utilizadora;
            não são utilizados para publicidade, perfilamento nem treino de
            modelos de IA/ML.
          </li>
          <li>
            <strong className="text-foreground">Revogação e eliminação:</strong>{" "}
            pode desconectar o Google Calendar na área de perfil da aplicação
            (remoção dos tokens no servidor) e revogar o acesso em{" "}
            <a
              href="https://myaccount.google.com/permissions"
              className="font-medium text-primary underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              myaccount.google.com/permissions
            </a>
            ; ao eliminar a conta Entrelivros, os dados associados, incluindo
            tokens Google, são removidos nos limites técnicos aplicáveis.
          </li>
        </ul>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          6. Conservação dos dados
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          Conservamos os dados enquanto a sua conta existir e forem necessários
          para o serviço. Após eliminação da conta ou pedido válido, os dados
          serão apagados ou anonimizados nos limites técnicos e legais aplicáveis.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          7. Encarregados de tratamento e transferências
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          A aplicação utiliza prestadores de infraestrutura (por exemplo,
          hospedagem da API e do site). O Google atua como responsável autônomo
          pelo tratamento dos dados processados nos seus produtos (Calendar,
          OAuth) segundo as políticas Google aplicáveis.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          8. Os seus direitos
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          Nos termos da legislação aplicável (por exemplo, a Lei Geral de
          Proteção de Dados Pessoais no Brasil), pode solicitar acesso,
          retificação, eliminação ou outras medidas sobre os seus dados
          pessoais, ou retirar consentimentos onde estes forem a base do
          tratamento, através do contato indicado na seção 1.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-foreground">
          9. Alterações a esta política
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          Podemos atualizar esta página para refletir mudanças no serviço ou
          obrigações legais. A data no topo indica a última revisão relevante.
        </p>
      </section>

      <p className="mt-12 text-sm text-muted-foreground">
        <Link
          to="/"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Voltar à página inicial
        </Link>
      </p>
    </div>
  );
}
