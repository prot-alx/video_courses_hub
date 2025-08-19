// app/api/admin/upload/video/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { execSync } from "child_process";

// Максимальный размер файла: 500MB
const MAX_FILE_SIZE = 500 * 1024 * 1024;

// Разрешенные форматы видео
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("video") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Видеофайл не предоставлен" },
        { status: 400 }
      );
    }

    // Проверяем тип файла
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Неподдерживаемый формат видео. Разрешены: ${ALLOWED_VIDEO_TYPES.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Проверяем размер файла
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `Файл слишком большой. Максимальный размер: ${
            MAX_FILE_SIZE / 1024 / 1024
          }MB`,
        },
        { status: 400 }
      );
    }

    // Создаем уникальное имя файла
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}-${originalName}`;

    // Создаем папку для видео если не существует
    const uploadsDir = join(process.cwd(), "uploads");
    const videosDir = join(uploadsDir, "videos");

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    if (!existsSync(videosDir)) {
      await mkdir(videosDir, { recursive: true });
    }

    // Сохраняем файл
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(videosDir, fileName);

    await writeFile(filePath, buffer);

    // Возвращаем информацию о загруженном файле
    return NextResponse.json({
      success: true,
      data: {
        filename: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Ошибка загрузки видео:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}

// Получить информацию о свободном месте
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    try {
      // Получаем информацию о свободном месте (Linux/Mac)
      const output = execSync("df -h .", { encoding: "utf8" });
      const lines = output.trim().split("\n");
      const data = lines[1].split(/\s+/);

      const diskInfo = {
        total: data[1],
        used: data[2],
        available: data[3],
        usePercentage: data[4],
      };

      return NextResponse.json({
        success: true,
        data: diskInfo,
      });
    } catch (diskError) {
      // Fallback для Windows или если команда не работает
      return NextResponse.json({
        success: true,
        data: {
          total: "N/A",
          used: "N/A",
          available: "N/A",
          usePercentage: "N/A",
        },
      });
    }
  } catch (error) {
    console.error("Ошибка получения информации о диске:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
