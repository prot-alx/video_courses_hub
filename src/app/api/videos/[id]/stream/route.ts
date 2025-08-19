// app/api/videos/[id]/stream/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createReadStream, existsSync, statSync } from "fs";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";
    const { id: videoId } = await params;

    // Получаем видео с информацией о курсе
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        course: {
          select: {
            id: true,
            isFree: true,
            userAccess: session?.user?.id
              ? {
                  where: { userId: session.user.id },
                  select: { userId: true },
                }
              : false,
          },
        },
      },
    });

    if (!video) {
      return new NextResponse("Видео не найдено", { status: 404 });
    }

    // Проверяем доступ к видео
    let hasAccess = video.isFree || video.course.isFree;

    if (!hasAccess && session?.user?.id) {
      if (isAdmin) {
        // Админу доступны все видео
        hasAccess = true;
      } else {
        // Для обычных пользователей проверяем доступ к курсу
        hasAccess = video.course.userAccess.length > 0;
      }
    }

    if (!hasAccess) {
      return new NextResponse("Доступ запрещен", { status: 403 });
    }

    // Путь к видеофайлу
    const videoPath = join(process.cwd(), "uploads", "videos", video.filename);

    if (!existsSync(videoPath)) {
      return new NextResponse("Видеофайл не найден", { status: 404 });
    }

    const stat = statSync(videoPath);
    const fileSize = stat.size;
    const range = request.headers.get("range");

    if (range) {
      // Поддержка Range запросов для seekable video
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const stream = createReadStream(videoPath, { start, end });

      return new NextResponse(stream as any, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize.toString(),
          "Content-Type": "video/mp4",
          "Cache-Control": "no-cache",
        },
      });
    } else {
      // Обычная отдача файла
      const stream = createReadStream(videoPath);
      return new NextResponse(stream as any, {
        headers: {
          "Content-Length": fileSize.toString(),
          "Content-Type": "video/mp4",
          "Cache-Control": "no-cache",
          "Accept-Ranges": "bytes",
        },
      });
    }
  } catch (error) {
    console.error("Ошибка стриминга видео:", error);
    return new NextResponse("Ошибка сервера", { status: 500 });
  }
}
