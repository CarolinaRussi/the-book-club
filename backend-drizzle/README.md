# Backend The Book Club (Drizzle ORM)

API em **Node**, **Express** e **Drizzle ORM** com PostgreSQL.

## Estrutura

- `db/schema.ts` – Definição das tabelas, enums e relações
- `db/client.ts` – Cliente Drizzle conectado ao PostgreSQL
- `controllers/` – Handlers das rotas
- `routes/` – Rotas Express
- `server/server.ts` – Entrada do servidor (porta **4001** por padrão; configurável via `PORT`)

## Como usar

1. **Variáveis de ambiente**

   Crie o `.env` a partir do `.env.example`. Variáveis necessárias: `DATABASE_URL`, `PORT`, `JWT_SECRET` e as do Cloudinary.

2. **Banco de dados**

   Com o PostgreSQL acessível:

   ```bash
   pnpm db:push    # sincroniza o schema com o banco (desenvolvimento)
   # ou
   pnpm db:generate  # gera novos arquivos de migração após mudar db/schema.ts
   pnpm db:migrate   # aplica migrações em sequência
   ```

   Banco já existente: rode `pnpm db:migrate` para aplicar migrações incrementais; ou `pnpm db:push` para alinhar o schema ao `schema.ts` sem histórico SQL.

3. **Desenvolvimento**

   ```bash
   cd backend-drizzle
   pnpm dev
   ```

   Servidor em `http://localhost:4001` (ou a porta em `PORT`).

## Scripts

| Script             | Descrição                          |
|--------------------|------------------------------------|
| `pnpm dev`         | Servidor em modo watch             |
| `pnpm build`       | Compila TypeScript para `dist/`    |
| `pnpm db:generate` | Gera migrações Drizzle             |
| `pnpm db:migrate`  | Aplica migrações                   |
| `pnpm db:push`     | Sincroniza schema com o banco      |
| `pnpm db:studio`   | Abre o Drizzle Studio no navegador |

## Detalhes úteis

- **IDs**: `nanoid` para novos registros.
- **Erros de constraint**: códigos PostgreSQL nativos (ex.: `23505` para violação de unique).

Para o frontend, aponte a URL da API para `http://localhost:4001` (ou a porta configurada em `PORT`).

## Regras de leitura por clube

- `Club.readingMode` define a estratégia de leitura do clube:
  - `book`: comportamento atual (ao concluir um encontro com livro, o livro do clube vai para `finished`).
  - `chapters`: o encontro pode informar `chapterStart` e `chapterEnd`; o livro só vai para `finished` quando o encontro concluído chegar ao último capítulo do livro.
- Encontros continuam aceitando `bookId` opcional (`null`/omitido = encontro sem livro).

### Campos novos do domínio

- `Book.totalChapters` (opcional)
- `Club.readingMode` (`book` por padrão)
- `Meeting.chapterStart` e `Meeting.chapterEnd` (opcionais)

### Payloads de reunião

- `POST /create-meeting`
- `PUT /update-meeting/:id`

Campos opcionais adicionais:

```json
{
  "bookId": "book_id_or_null",
  "chapterStart": 1,
  "chapterEnd": 3
}
```

Validações:

- `chapterStart` e `chapterEnd` devem ser inteiros >= 1.
- Se um for enviado, o outro também deve ser enviado.
- `chapterEnd` deve ser maior/igual a `chapterStart`.
- Intervalo de capítulos só é aceito para clube em modo `chapters` e com `bookId` definido.
