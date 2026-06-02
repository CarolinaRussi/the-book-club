# The BookClub

Plataforma voltada para clubes do livro, criada para facilitar a organização de encontros, o registro de leituras e a troca de experiências entre leitoras.  
Permite marcar reuniões, salvar livros lidos com notas e reviews, e descobrir outras pessoas com interesses literários em comum.

---

## Como rodar o projeto localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/CarolinaRussi/the-book-club.git
```

Entre na pasta do projeto:

```bash
cd the-book-club
```

### 2. Instalar o pnpm (caso ainda não tenha)

No PowerShell do Windows, execute:

```bash
Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression
```

Ou se tiver npm instalado:

```bash
npm i -g pnpm
```

Depois verifique se a instalação foi concluída com sucesso:

```bash
pnpm -v
```

### 3. Instalar as dependências do projeto

```bash
pnpm install
```

### 4. Rodar o projeto em modo de desenvolvimento

Na raiz do projeto, execute:

```bash
pnpm dev
```

Esse comando sobe o backend (`backend-drizzle`) e o frontend (`frontend`) ao mesmo tempo.

Se precisar rodar apenas uma parte do projeto:

```bash
pnpm --filter backend-drizzle dev
pnpm --filter frontend dev
```

O terminal exibirá um endereço local (geralmente http://localhost:5173).
Abra esse link no navegador para visualizar o app.

## Atualização do schema do banco

Altere `backend-drizzle/db/schema.ts`. Em seguida, na pasta `backend-drizzle`:

```bash
pnpm db:generate   # gera migração SQL a partir das mudanças
pnpm db:migrate    # aplica migrações

# ou, em desenvolvimento, sincronizar direto sem arquivo de migração:
pnpm db:push
```

## Modos de leitura do clube

Agora cada clube pode ser configurado para:

- `Por livro`: ao concluir um encontro com livro selecionado, o livro do clube é finalizado.
- `Por capítulos`: você pode informar `capítulo inicial` e `capítulo final` no encontro; o livro só é finalizado quando o encontro concluído atingir o último capítulo do livro.

Para suporte a esse fluxo, livros aceitam `total de capítulos` opcional no cadastro.

# Tecnologias utilizadas

#Frontend 
React  
react-icons  
react-router
tanstack/react-query
react-toastify
react-hook-form
react-simple-star-rating
shadcn (pnpm dlx shadcn@latest add nomeDoComponente)
Vite  
Tailwind  
Context API  
TypeScript

#Back-end
Node
Express
Cors  
Axios
bcryptjs 
jsonwebtoken
cloudinary
multer
dotenv
Drizzle ORM
pnpm
pg
Neon (PostgreSQL em nuvem)

# Objetivo do projeto

O BookClub nasceu da ideia de criar um espaço digital para fortalecer clubes de leitura — um ambiente onde leitoras possam se conectar, acompanhar suas leituras e planejar encontros de forma simples e interativa.

Desenvolvido por Carolina Russi Ferla
