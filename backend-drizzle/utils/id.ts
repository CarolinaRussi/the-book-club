import { nanoid } from "nanoid";

/** Gera um ID único no estilo CUID (compatível com tamanho semelhante ao Prisma cuid) */
export function createId(): string {
  return nanoid(21);
}
