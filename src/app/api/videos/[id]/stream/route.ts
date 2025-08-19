// app/api/videos/[id]/stream/route.ts (обновленная версия с типизацией)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createReadStream, existsSync, statSync } from "fs";
import { join } from "path";
import { Readable } from "stream";

// Типизированный интерфейс для параметров
interface VideoStreamParams {
  params: Promise<{ id: string }>;
}

// Исправленная функция с правильной типизацией
function nodeStreamToWebStream(
  nodeStream: Readable // Используем Readable вместо NodeJS.ReadableStream
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      let isClosed = false;

      const cleanup = () => {
        if (!isClosed) {
          isClosed = true;
          nodeStream.destroy(); // Теперь destroy() доступен
        }
      };

      nodeStream.on("data", (chunk: Buffer) => {
        if (!isClosed && controller.desiredSize !== null) {
          try {
            controller.enqueue(new Uint8Array(chunk));
          } catch (err) {
            console.log(err);
            cleanup();
          }
        }
      });

      nodeStream.on("end", () => {
        if (!isClosed) {
          controller.close();
          cleanup();
        }
      });

      nodeStream.on("error", (error) => {
        if (!isClosed) {
          controller.error(error);
          cleanup();
        }
      });

      nodeStream.on("close", cleanup);
    },

    cancel() {
      nodeStream.destroy();
    },
  });
}
export async function GET(request: NextRequest, { params }: VideoStreamParams) {
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

      const nodeStream = createReadStream(videoPath, { start, end });
      const webStream = nodeStreamToWebStream(nodeStream);

      return new NextResponse(webStream, {
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
      const nodeStream = createReadStream(videoPath);
      const webStream = nodeStreamToWebStream(nodeStream);

      return new NextResponse(webStream, {
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
