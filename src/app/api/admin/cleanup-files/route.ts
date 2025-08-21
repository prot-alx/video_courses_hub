import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readdir, unlink, stat } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// POST /api/admin/cleanup-files - очистить неиспользуемые файлы
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const { fileType } = await request.json().catch(() => ({}));

    const cleanupResults = {
      videos: { deleted: 0, failed: 0, details: [] as string[] },
      thumbnails: { deleted: 0, failed: 0, details: [] as string[] },
    };

    // Очистка видеофайлов
    if (!fileType || fileType === "videos") {
      const videoResults = await cleanupUnusedVideos();
      cleanupResults.videos = videoResults;
    }

    // Очистка превью
    if (!fileType || fileType === "thumbnails") {
      const thumbnailResults = await cleanupUnusedThumbnails();
      cleanupResults.thumbnails = thumbnailResults;
    }

    // Логируем действие
    await prisma.simpleLog.create({
      data: {
        action: "files_cleanup",
        details:
          `Админ ${session.user.email} выполнил очистку файлов. ` +
          `Видео: удалено ${cleanupResults.videos.deleted}, ошибок ${cleanupResults.videos.failed}. ` +
          `Превью: удалено ${cleanupResults.thumbnails.deleted}, ошибок ${cleanupResults.thumbnails.failed}.`,
      },
    });

    return NextResponse.json({
      success: true,
      data: cleanupResults,
      message: "Очистка файлов завершена",
    });
  } catch (error) {
    console.error("Ошибка очистки файлов:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}

// GET /api/admin/cleanup-files - получить статистику неиспользуемых файлов
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const stats = {
      videos: await getUnusedVideosStats(),
      thumbnails: await getUnusedThumbnailsStats(),
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Ошибка получения статистики файлов:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}

// Функции-помощники
async function cleanupUnusedVideos() {
  const result = { deleted: 0, failed: 0, details: [] as string[] };

  try {
    const videosDir = join(process.cwd(), "uploads", "videos");

    if (!existsSync(videosDir)) {
      return result;
    }

    // Получаем все файлы в папке videos
    const files = await readdir(videosDir);

    // Получаем все используемые имена файлов из БД
    const usedFiles = await prisma.video.findMany({
      select: { filename: true },
    });
    const usedFilenames = new Set(usedFiles.map((v) => v.filename));

    // Удаляем неиспользуемые файлы
    for (const filename of files) {
      if (!usedFilenames.has(filename)) {
        try {
          const filePath = join(videosDir, filename);
          const stats = await stat(filePath);
          await unlink(filePath);
          result.deleted++;
          result.details.push(
            `${filename} (${Math.round(stats.size / 1024 / 1024)}MB)`
          );
        } catch (error) {
          result.failed++;
          console.error(`Ошибка удаления видеофайла ${filename}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Ошибка очистки видеофайлов:", error);
  }

  return result;
}

async function cleanupUnusedThumbnails() {
  const result = { deleted: 0, failed: 0, details: [] as string[] };

  try {
    const thumbnailsDir = join(process.cwd(), "uploads", "thumbnails");

    if (!existsSync(thumbnailsDir)) {
      return result;
    }

    // Получаем все файлы в папке thumbnails
    const files = await readdir(thumbnailsDir);

    // Получаем все используемые превью из БД
    const usedThumbnails = await prisma.course.findMany({
      select: { thumbnail: true },
      where: { thumbnail: { not: null } },
    });

    const usedFilenames = new Set(
      usedThumbnails
        .map((c) => c.thumbnail)
        .filter(Boolean)
        .map((thumb) =>
          thumb!.includes("/") ? thumb!.split("/").pop() : thumb
        )
        .filter(Boolean)
    );

    // Удаляем неиспользуемые файлы
    for (const filename of files) {
      if (!usedFilenames.has(filename)) {
        try {
          const filePath = join(thumbnailsDir, filename);
          const stats = await stat(filePath);
          await unlink(filePath);
          result.deleted++;
          result.details.push(
            `${filename} (${Math.round(stats.size / 1024)}KB)`
          );
        } catch (error) {
          result.failed++;
          console.error(`Ошибка удаления превью ${filename}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Ошибка очистки превью:", error);
  }

  return result;
}

async function getUnusedVideosStats() {
  try {
    const videosDir = join(process.cwd(), "uploads", "videos");
    if (!existsSync(videosDir)) return { total: 0, unused: 0, size: 0 };

    const files = await readdir(videosDir);
    const usedFiles = await prisma.video.findMany({
      select: { filename: true },
    });
    const usedFilenames = new Set(usedFiles.map((v) => v.filename));

    let unusedCount = 0;
    let totalSize = 0;

    for (const filename of files) {
      if (!usedFilenames.has(filename)) {
        unusedCount++;
        try {
          const stats = await stat(join(videosDir, filename));
          totalSize += stats.size;
        } catch (error) {
          // Игнорируем ошибки получения размера файла
          console.log(error);
        }
      }
    }

    return {
      total: files.length,
      unused: unusedCount,
      size: totalSize,
    };
  } catch (error) {
    console.log(error);
    return { total: 0, unused: 0, size: 0 };
  }
}

async function getUnusedThumbnailsStats() {
  try {
    const thumbnailsDir = join(process.cwd(), "uploads", "thumbnails");
    if (!existsSync(thumbnailsDir)) return { total: 0, unused: 0, size: 0 };

    const files = await readdir(thumbnailsDir);
    const usedThumbnails = await prisma.course.findMany({
      select: { thumbnail: true },
      where: { thumbnail: { not: null } },
    });

    const usedFilenames = new Set(
      usedThumbnails
        .map((c) => c.thumbnail)
        .filter(Boolean)
        .map((thumb) =>
          thumb!.includes("/") ? thumb!.split("/").pop() : thumb
        )
        .filter(Boolean)
    );

    let unusedCount = 0;
    let totalSize = 0;

    for (const filename of files) {
      if (!usedFilenames.has(filename)) {
        unusedCount++;
        try {
          const stats = await stat(join(thumbnailsDir, filename));
          totalSize += stats.size;
        } catch (error) {
          console.log(error);
          // Игнорируем ошибки получения размера файла
        }
      }
    }

    return {
      total: files.length,
      unused: unusedCount,
      size: totalSize,
    };
  } catch (error) {
    console.log(error);
    return { total: 0, unused: 0, size: 0 };
  }
}
