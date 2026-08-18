# Entrelivros

Plataforma voltada para clubes do livro ([entrelivros.com](https://entrelivros.com)), criada para facilitar a organização de encontros, o registro de leituras e a troca de experiências entre leitoras.  
Permite marcar reuniões, organizar leituras por livro ou capítulos, salvar livros lidos com notas e reviews, e descobrir outras pessoas com interesses literários em comum.

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
pnpm exec drizzle-kit generate --name=descricao_da_mudanca
pnpm db:migrate    # aplica migrações

# ou, em desenvolvimento, sincronizar direto sem arquivo de migração:
pnpm db:push
```

Depois de migrar (clone novo ou migração de coordenadas das cidades), popule UFs, municípios e centroides usados no Explorar:

```bash
cd backend-drizzle
pnpm run db:seed-ibge
```

Sem esse seed, os selects de cidade e o mapa de clubes públicos ficam vazios.

# Tecnologias utilizadas

#Frontend 
React  
react-icons  
react-router
tanstack/react-query
react-toastify
react-hook-form
react-simple-star-rating
leaflet / react-leaflet (mapa do Explorar, tiles OpenStreetMap)
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

O BookClub nasceu da ideia de criar um espaço digital para fortalecer clubes de leitura, um ambiente onde leitoras possam se conectar, acompanhar suas leituras e planejar encontros de forma simples e interativa.

Desenvolvido por Carolina Russi Ferla
