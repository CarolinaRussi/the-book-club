export const READING_STATUS_VALUES = [
  "want_to_read",
  "not_started",
  "started",
  "dropped",
  "finished",
] as const;

export type ReadingStatus = (typeof READING_STATUS_VALUES)[number];

export const READING_STATUS_WANT_TO_READ: ReadingStatus = "want_to_read";
export const READING_STATUS_NOT_STARTED: ReadingStatus = "not_started";
export const READING_STATUS_STARTED: ReadingStatus = "started";
export const READING_STATUS_DROPPED: ReadingStatus = "dropped";
export const READING_STATUS_FINISHED: ReadingStatus = "finished";

export const readingStatusLabels: Record<ReadingStatus, string> = {
  [READING_STATUS_WANT_TO_READ]: "Quero Ler",
  [READING_STATUS_NOT_STARTED]: "Não Iniciado",
  [READING_STATUS_STARTED]: "Leitura Atual",
  [READING_STATUS_DROPPED]: "Abandonado",
  [READING_STATUS_FINISHED]: "Finalizado",
};

export const readingStatusFormOptions: {
  value: Exclude<ReadingStatus, "want_to_read">;
  label: string;
}[] = [
  {
    value: READING_STATUS_NOT_STARTED,
    label: readingStatusLabels[READING_STATUS_NOT_STARTED],
  },
  {
    value: READING_STATUS_STARTED,
    label: readingStatusLabels[READING_STATUS_STARTED],
  },
  {
    value: READING_STATUS_DROPPED,
    label: readingStatusLabels[READING_STATUS_DROPPED],
  },
  {
    value: READING_STATUS_FINISHED,
    label: readingStatusLabels[READING_STATUS_FINISHED],
  },
];
