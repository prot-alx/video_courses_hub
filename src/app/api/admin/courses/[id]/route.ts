import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UpdateCourseSchema } from "@/lib/validations";

// GET /api/admin/courses/[id] - получить курс для редактирования
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        videos: {
          select: {
            id: true,
            title: true,
            displayName: true,
            description: true,
            filename: true,
            isFree: true,
            duration: true,
            orderIndex: true,
            createdAt: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
        _count: {
          select: {
            videos: true,
            userAccess: true,
            requests: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Курс не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Ошибка получения курса:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/courses/[id] - обновить курс
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = UpdateCourseSchema.parse(body);

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.shortDescription !== undefined && {
          shortDescription: validatedData.shortDescription,
        }),
        ...(validatedData.fullDescription !== undefined && {
          fullDescription: validatedData.fullDescription,
        }),
        ...(validatedData.price !== undefined && {
          price: validatedData.price,
        }),
        ...(validatedData.isFree !== undefined && {
          isFree: validatedData.isFree,
        }),
        ...(validatedData.isActive !== undefined && {
          isActive: validatedData.isActive,
        }),
        ...(validatedData.thumbnail !== undefined && {
          thumbnail: validatedData.thumbnail,
        }),
      },
    });

    await prisma.simpleLog.create({
      data: {
        action: "course_updated",
        details: `Админ ${session.user.email} обновил курс "${course.title}" (ID: ${course.id})`,
      },
    });

    return NextResponse.json({
      success: true,
      data: course,
      message: "Курс успешно обновлен",
    });
  } catch (error) {
    console.error("Ошибка обновления курса:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Неверные данные курса" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/courses/[id] - удалить курс
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Получаем курс с видео для удаления файлов
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        videos: {
          select: { id: true, filename: true, displayName: true },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Курс не найден" },
        { status: 404 }
      );
    }

    // Удаляем файлы видео
    const { unlink } = await import("fs/promises");
    const { join } = await import("path");
    const { existsSync } = await import("fs");

    const deletedFiles = [];
    const failedFiles = [];

    // Удаляем все видеофайлы курса
    for (const video of course.videos) {
      try {
        const videoPath = join(
          process.cwd(),
          "uploads",
          "videos",
          video.filename
        );
        if (existsSync(videoPath)) {
          await unlink(videoPath);
          deletedFiles.push(`video: ${video.filename}`);
          console.log(`Удален видеофайл: ${videoPath}`);
        }
      } catch (fileError) {
        console.error(
          `Ошибка удаления видеофайла ${video.filename}:`,
          fileError
        );
        failedFiles.push(`video: ${video.filename}`);
      }
    }

    // Удаляем превью курса
    if (course.thumbnail) {
      try {
        let thumbnailPath;

        // Определяем путь к превью
        if (course.thumbnail.startsWith("/uploads/")) {
          thumbnailPath = join(process.cwd(), course.thumbnail.substring(1));
        } else {
          thumbnailPath = join(
            process.cwd(),
            "uploads",
            "thumbnails",
            course.thumbnail
          );
        }

        if (existsSync(thumbnailPath)) {
          await unlink(thumbnailPath);
          deletedFiles.push(`thumbnail: ${course.thumbnail}`);
          console.log(`Удалена превью: ${thumbnailPath}`);
        }
      } catch (fileError) {
        console.error(`Ошибка удаления превью ${course.thumbnail}:`, fileError);
        failedFiles.push(`thumbnail: ${course.thumbnail}`);
      }
    }

    // Удаляем курс из БД (каскадное удаление видео настроено в схеме)
    await prisma.course.delete({
      where: { id },
    });

    // Логируем удаление
    await prisma.simpleLog.create({
      data: {
        action: "course_deleted_with_files",
        details:
          `Админ ${session.user.email} удалил курс "${course.title}" (ID: ${course.id}). ` +
          `Удалено файлов: ${deletedFiles.length}. ` +
          `Ошибок удаления: ${failedFiles.length}. ` +
          `Удалённые файлы: ${deletedFiles.join(", ")}. ` +
          (failedFiles.length > 0
            ? `Не удалось удалить: ${failedFiles.join(", ")}.`
            : ""),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Курс и связанные файлы удалены",
      data: {
        deletedFiles: deletedFiles.length,
        failedFiles: failedFiles.length,
        details: {
          deleted: deletedFiles,
          failed: failedFiles,
        },
      },
    });
  } catch (error) {
    console.error("Ошибка удаления курса:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
