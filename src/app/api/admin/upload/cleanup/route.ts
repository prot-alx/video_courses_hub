import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// DELETE /api/admin/upload/cleanup - удалить неиспользуемый файл
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");
    const type = searchParams.get("type") || "video"; // video или thumbnail

    if (!filename) {
      return NextResponse.json(
        { success: false, error: "Имя файла обязательно" },
        { status: 400 }
      );
    }

    // Определяем путь в зависимости от типа файла
    const uploadsDir = join(process.cwd(), "uploads");
    const filePath =
      type === "thumbnail"
        ? join(uploadsDir, "thumbnails", filename)
        : join(uploadsDir, "videos", filename);

    // Проверяем что файл существует
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: "Файл не найден" },
        { status: 404 }
      );
    }

    // Удаляем файл
    await unlink(filePath);

    console.log(`Неиспользуемый файл удален: ${filePath}`);

    return NextResponse.json({
      success: true,
      message: "Файл удален",
    });
  } catch (error) {
    console.error("Ошибка удаления файла:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
