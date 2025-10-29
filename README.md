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

Conectar no banco de dados

```bash
npx tsx src/db/server.ts
```

Rodar o front

```bash
pnpm dev
```

O terminal exibirá um endereço local (geralmente http://localhost:5173).
Abra esse link no navegador para visualizar o app.

# Tecnologias utilizadas

React  
react-icons  
react-router
react-toastify
react-hook-form
Vite  
TypeScript  
Tailwind  
Context API  
Express
Axios 
jsonwebtoken
Neon (PostgreSQL em nuvem)

# Objetivo do projeto

O BookClub nasceu da ideia de criar um espaço digital para fortalecer clubes de leitura — um ambiente onde leitoras possam se conectar, acompanhar suas leituras e planejar encontros de forma simples e interativa.

Desenvolvido por Carolina Russi Ferla
