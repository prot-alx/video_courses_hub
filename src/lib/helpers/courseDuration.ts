import { prisma } from "@/lib/prisma";

/**
 * Пересчитывает и обновляет общую длительность курса
 * @param courseId - ID курса
 * @returns обновленная длительность в секундах
 */
export async function updateCourseDuration(courseId: string): Promise<number> {
  try {
    // Получаем все видео курса и суммируем их длительность
    const videos = await prisma.video.findMany({
      where: { courseId },
      select: { duration: true },
    });

    const totalDuration = videos.reduce(
      (sum, video) => sum + (video.duration || 0),
      0
    );

    // Обновляем курс
    await prisma.course.update({
      where: { id: courseId },
      data: { totalDuration },
    });

    return totalDuration;
  } catch (error) {
    console.error(`Ошибка обновления длительности курса ${courseId}:`, error);
    return 0;
  }
}

/**
 * Массовое обновление длительности всех курсов
 * Полезно для миграции существующих данных
 */
export async function updateAllCoursesDuration(): Promise<void> {
  try {
    const courses = await prisma.course.findMany({
      select: { id: true },
    });

    const updatePromises = courses.map((course) =>
      updateCourseDuration(course.id)
    );

    await Promise.all(updatePromises);
    console.log(`Обновлена длительность для ${courses.length} курсов`);
  } catch (error) {
    console.error("Ошибка массового обновления длительности курсов:", error);
  }
}
