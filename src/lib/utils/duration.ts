// lib/utils/duration.ts (финальная унифицированная версия)

/**
 * Форматирует длительность в секундах в читаемый вид
 * @param seconds - длительность в секундах
 * @param format - формат вывода ('full' | 'short' | 'compact')
 * @returns отформатированная строка
 */
export function formatDuration(
  seconds: number | null | undefined,
  format: "full" | "short" | "compact" = "full"
): string {
  if (!seconds || seconds <= 0) return "N/A";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  switch (format) {
    case "compact":
      // Компактный формат: 1:23:45 или 23:45 или 0:45
      if (hours > 0) {
        return `${hours}:${minutes
          .toString()
          .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
      } else {
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
      }

    case "short":
      // Короткий формат для UI: 1ч 23м или 23м (без секунд для чистоты)
      if (hours > 0) {
        return minutes > 0 ? `${hours}ч ${minutes}м` : `${hours}ч`;
      } else if (minutes > 0) {
        return `${minutes}м`;
      } else {
        return `${remainingSeconds}с`;
      }

    case "full":
    default:
      // Полный формат: 1ч 23м 45с
      if (hours > 0) {
        if (minutes > 0 && remainingSeconds > 0) {
          return `${hours}ч ${minutes}м ${remainingSeconds}с`;
        } else if (minutes > 0) {
          return `${hours}ч ${minutes}м`;
        } else if (remainingSeconds > 0) {
          return `${hours}ч ${remainingSeconds}с`;
        } else {
          return `${hours}ч`;
        }
      } else if (minutes > 0) {
        return remainingSeconds > 0
          ? `${minutes}м ${remainingSeconds}с`
          : `${minutes}м`;
      } else {
        return `${remainingSeconds}с`;
      }
  }
}

/**
 * Форматирует общую длительность курса (суммирует все видео)
 * @param videos - массив видео с полем duration
 * @param format - формат вывода
 * @returns отформатированная строка общей длительности
 */
export function formatCourseDuration(
  videos: Array<{ duration: number | null }>,
  format: "full" | "short" | "compact" = "short"
): string {
  const totalSeconds = videos.reduce(
    (acc, video) => acc + (video.duration || 0),
    0
  );
  return formatDuration(totalSeconds, format);
}

/**
 * Парсит длительность из строки формата MM:SS или HH:MM:SS
 * @param timeString - строка времени
 * @returns длительность в секундах или null
 */
export function parseDuration(timeString: string): number | null {
  if (!timeString || timeString.trim() === "") return null;

  const parts = timeString.split(":").map((part) => parseInt(part, 10));

  if (parts.some((part) => isNaN(part))) return null;

  if (parts.length === 2) {
    // MM:SS формат
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  } else if (parts.length === 3) {
    // HH:MM:SS формат
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  return null;
}
