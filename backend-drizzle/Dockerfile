# Build a partir da raiz do monorepo:
#   docker build -f backend-drizzle/Dockerfile -t entrelivros-api .

FROM node:20-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate
WORKDIR /app

FROM base AS build
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY backend-drizzle/package.json ./backend-drizzle/
RUN pnpm install --filter=backend-drizzle... --frozen-lockfile
COPY backend-drizzle ./backend-drizzle
RUN pnpm --filter=backend-drizzle build

FROM base AS production
ENV NODE_ENV=production
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY backend-drizzle/package.json ./backend-drizzle/
RUN pnpm install --filter=backend-drizzle... --prod --frozen-lockfile
COPY --from=build /app/backend-drizzle/dist ./backend-drizzle/dist
WORKDIR /app/backend-drizzle
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/server/server.js"]
