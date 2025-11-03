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
    }).format(date);

    const year = date.getFullYear();

    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

    return `${capitalizedMonth} ${year}`;
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "";
  }
};
