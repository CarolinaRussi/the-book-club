import { BookStatus } from "../types/IBooks";


export const bookStatusLabels: Record<BookStatus, string> = {
  suggested: "Sugerido",
  started: "Leitura Atual",
  dropped: "Abandonado",
  finished: "Finalizado",
};