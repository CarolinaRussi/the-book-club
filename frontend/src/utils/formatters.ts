export const getInitials = (name: string) => {
  if (!name) return "?";

  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export const formatMonthYear = (dateString: string): string => {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.warn("formatMonthYear: Data inválida recebida", dateString);
      return "";
    }

    const month = new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      timeZone: "UTC",
    }).format(date);

    const year = date.getUTCFullYear();

    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

    return `${capitalizedMonth} ${year}`;
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "";
  }
};

/** Converte valor da API (string "YYYY-MM-DD", ISO ou Date) em Date para formatação */
function parseDate(value: string | Date | undefined): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const str = String(value).trim();
  if (!str) return null;
  // API Drizzle/Postgres pode vir só como "YYYY-MM-DD" → evita mudar dia por fuso
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(str);
  const date = new Date(dateOnly ? `${str}T12:00:00` : str);
  return isNaN(date.getTime()) ? null : date;
}

export const formatDayMonthYear = (
  dateValue: string | Date | undefined
): string => {
  try {
    const date = parseDate(dateValue);
    if (!date) return "";

    const day = date.getDate().toString().padStart(2, "0");
    const month = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(
      date
    );
    const year = date.getFullYear();
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

    return `${day} de ${capitalizedMonth} de ${year}`;
  } catch (error) {
    console.error("Erro ao formatar data (dia/mês/ano):", error);
    return "";
  }
};

/** Aceita hora só "HH:MM:SS" / "HH:mm" (API) ou string ISO/datetime completa */
export const formatTime = (timeValue: string | undefined): string => {
  try {
    if (!timeValue) return "";
    const str = String(timeValue).trim();
    // API Drizzle/Postgres pode vir só como "HH:MM:SS" ou "HH:mm" (não parseável com new Date em todos os browsers)
    const timeOnlyMatch = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (timeOnlyMatch) {
      const hours = timeOnlyMatch[1].padStart(2, "0");
      const minutes = timeOnlyMatch[2].padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    const date = new Date(str);
    if (isNaN(date.getTime())) return "";
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error("Erro ao formatar hora:", error);
    return "";
  }
};
