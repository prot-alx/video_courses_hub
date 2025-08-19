import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

// POST /api/admin/upload/thumbnail - загрузить превью курса
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Проверка админских прав
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const data = await request.formData();
    const file: File | null = data.get("thumbnail") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Файл не выбран" },
        { status: 400 }
      );
    }

    // Проверка типа файла
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Неподдерживаемый формат файла. Разрешены: JPG, PNG, WebP",
        },
        { status: 400 }
      );
    }

    // Проверка размера файла (максимум 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "Файл слишком большой. Максимум 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Создаем папку thumbnails если её нет
    const uploadsDir = join(process.cwd(), "uploads");
    const thumbnailsDir = join(uploadsDir, "thumbnails");

    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }
    if (!existsSync(thumbnailsDir)) {
      mkdirSync(thumbnailsDir, { recursive: true });
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const fileName = `thumbnail_${timestamp}.${extension}`;
    const filePath = join(thumbnailsDir, fileName);

    // Сохраняем файл
    await writeFile(filePath, buffer);

    // Возвращаем относительный путь для сохранения в БД
    const relativePath = `/uploads/thumbnails/${fileName}`;

    return NextResponse.json({
      success: true,
      data: {
        filename: fileName,
        path: relativePath,
        url: relativePath, // Для использования в <img src="">
      },
      message: "Превью успешно загружено",
    });
  } catch (error) {
    console.error("Ошибка загрузки превью:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка сервера при загрузке файла" },
      { status: 500 }
    );
  }
}
