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

export const formatDayMonthYear = (dateString: string | undefined): string => {
  try {
    if (!dateString) return "";
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.warn("formatDayMonthYear: Data inválida recebida", dateString);
      return "";
    }

    const day = date.getUTCDate().toString().padStart(2, "0");

    const month = new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      timeZone: "UTC",
    }).format(date);

    const year = date.getUTCFullYear();

    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

    return `${day} de ${capitalizedMonth} de ${year}`;
  } catch (error) {
    console.error("Erro ao formatar data (dia/mês/ano):", error);
    return "";
  }
};

export const formatTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.warn("formatTime: Data inválida recebida", dateString);
      return "";
    }

    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  } catch (error) {
    console.error("Erro ao formatar hora:", error);
    return "";
  }
};
