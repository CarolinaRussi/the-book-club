# Backend The Book Club (Drizzle ORM)

Backend alternativo do The Book Club usando **Drizzle ORM** em vez de Prisma. A estrutura e as rotas foram mantidas equivalentes ao backend original para facilitar a troca.

## Estrutura

- `db/schema.ts` – Schema das tabelas e relações (equivalente ao `prisma/schema.prisma`)
- `db/client.ts` – Cliente Drizzle conectado ao PostgreSQL
- `controllers/` – Lógica de negócio (adaptada de Prisma para Drizzle)
- `routes/` – Rotas Express (mesmas URLs do backend original)
- `server/server.ts` – Entrada do servidor (porta **4001** por padrão, para não conflitar com o backend Prisma na 4000)

## Como usar

1. **Variáveis de ambiente**

   Crie o `.env` a partir do `.env.example`. Variáveis necessárias: `DATABASE_URL`, `PORT`, `JWT_SECRET` e as do Cloudinary.

2. **Banco de dados**

   Se você já usa o backend com Prisma, o mesmo banco pode ser usado: as tabelas e enums já existem. Só é necessário rodar migrações do Drizzle se estiver criando o banco do zero:

   ```bash
   pnpm db:push    # cria/atualiza tabelas a partir do schema
   # ou
   pnpm db:generate  # gera arquivos de migração
   pnpm db:migrate   # aplica migrações
   ```

3. **Desenvolvimento**

   ```bash
   cd backend-drizzle
   pnpm dev
   ```

   O servidor sobe em `http://localhost:4001`.

## Scripts

| Script        | Descrição                          |
|---------------|------------------------------------|
| `pnpm dev`    | Sobe o servidor em modo watch      |
| `pnpm build`  | Compila TypeScript para `dist/`    |
| `pnpm db:generate` | Gera migrações Drizzle        |
| `pnpm db:push` | Sincroniza o schema com o banco    |
| `pnpm db:studio` | Abre o Drizzle Studio no navegador |

## Diferenças em relação ao backend Prisma

- **IDs**: uso de `nanoid` em vez de `cuid` (compatível em tamanho).
- **Erros de constraint**: códigos PostgreSQL (ex.: `23505` para unique) em vez dos códigos Prisma (`P2002`, etc.).
- **Porta padrão**: 4001 (Prisma continua em 4000).

Para usar o frontend com este backend, aponte a URL da API para `http://localhost:4001` (ou a porta configurada em `PORT`).
