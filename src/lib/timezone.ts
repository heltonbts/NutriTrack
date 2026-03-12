const SAO_PAULO_TIME_ZONE = "America/Sao_Paulo";

function getTimeZoneParts(
  date: Date,
  timeZone: string,
): Record<string, string> {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((parts, part) => {
      if (part.type !== "literal") {
        parts[part.type] = part.value;
      }

      return parts;
    }, {});
}

export function getSaoPauloQuizDate(date: Date = new Date()): Date {
  const parts = getTimeZoneParts(date, SAO_PAULO_TIME_ZONE);

  return new Date(
    Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      12,
      0,
      0,
      0,
    ),
  );
}

export function formatInSaoPaulo(
  date: string | Date,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: SAO_PAULO_TIME_ZONE,
    ...options,
  }).format(new Date(date));
}
