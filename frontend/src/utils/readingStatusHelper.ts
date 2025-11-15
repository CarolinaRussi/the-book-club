import type { ReadingStatus } from "../types/IBooks";

export const readingStatusLabels: Record<ReadingStatus, string> = {
  not_started: "Não Iniciado",
  started: "Leitura Atual",
  dropped: "Abandonado",
  finished: "Finalizado",
};
