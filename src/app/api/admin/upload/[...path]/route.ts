// app/api/admin/upload/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// GET /api/uploads/[...path] - раздача статических файлов
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filePath = join(process.cwd(), "uploads", ...path);

    // Проверяем что файл существует
    if (!existsSync(filePath)) {
      return new NextResponse("Файл не найден", { status: 404 });
    }

    // Читаем файл
    const fileBuffer = await readFile(filePath);

    // Определяем MIME тип по расширению
    const extension = path[path.length - 1].split(".").pop()?.toLowerCase();

    let contentType = "application/octet-stream";
    switch (extension) {
      case "jpg":
      case "jpeg":
        contentType = "image/jpeg";
        break;
      case "png":
        contentType = "image/png";
        break;
      case "webp":
        contentType = "image/webp";
        break;
      case "mp4":
        contentType = "video/mp4";
        break;
      case "webm":
        contentType = "video/webm";
        break;
    }

    // Возвращаем файл с правильными заголовками
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000", // Кеш на год
      },
    });
  } catch (error) {
    console.error("Ошибка раздачи файла:", error);
    return new NextResponse("Ошибка сервера", { status: 500 });
  }
}
