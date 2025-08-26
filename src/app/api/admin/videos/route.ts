import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateVideoSchema, UpdateVideoSchema } from "@/lib/validations";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { updateCourseDuration } from "@/lib/helpers/courseDuration";

// Получить все видео или видео курса
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    const whereClause = courseId ? { courseId } : {};

    const videos = await prisma.video.findMany({
      where: whereClause,
      include: {
        course: {
          select: { id: true, title: true },
        },
      },
      orderBy: [{ courseId: "asc" }, { orderIndex: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: videos,
    });
  } catch (error) {
    console.error("Ошибка получения видео:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}

// Создать новое видео (метаданные)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = CreateVideoSchema.parse(body);

    // Проверяем что курс существует
    const course = await prisma.course.findUnique({
      where: { id: validatedData.courseId },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Курс не найден" },
        { status: 404 }
      );
    }

    // Получаем следующий orderIndex
    const lastVideo = await prisma.video.findFirst({
      where: { courseId: validatedData.courseId },
      orderBy: { orderIndex: "desc" },
    });

    const nextOrderIndex = (lastVideo?.orderIndex ?? -1) + 1;

    const video = await prisma.video.create({
      data: {
        ...validatedData,
        title: validatedData.displayName, // Копируем для совместимости
        orderIndex: validatedData.orderIndex ?? nextOrderIndex,
      },
      include: {
        course: {
          select: { id: true, title: true },
        },
      },
    });

    // Обновляем длительность курса
    await updateCourseDuration(validatedData.courseId);

    return NextResponse.json({
      success: true,
      data: video,
    });
  } catch (error) {
    console.error("Ошибка создания видео:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}

// Удалить видео
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("id");

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: "ID видео обязателен" },
        { status: 400 }
      );
    }

    // Получаем видео для удаления файла
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json(
        { success: false, error: "Видео не найдено" },
        { status: 404 }
      );
    }

    // Удаляем файл с диска
    const videoPath = join(process.cwd(), "uploads", "videos", video.filename);
    try {
      if (existsSync(videoPath)) {
        await unlink(videoPath);
        console.log(`Видеофайл удален: ${videoPath}`);
      }
    } catch (fileError) {
      console.error("Ошибка удаления файла:", fileError);
      // Продолжаем удаление из БД даже если файл не удалился
    }

    // Удаляем из БД
    await prisma.video.delete({
      where: { id: videoId },
    });

    // Обновляем длительность курса после удаления
    await updateCourseDuration(video.courseId);

    // Логируем действие
    await prisma.simpleLog.create({
      data: {
        action: "video_deleted",
        details: `Видео "${video.displayName || video.title}" (${
          video.filename
        }) удалено администратором ${session.user.email}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Видео удалено",
    });
  } catch (error) {
    console.error("Ошибка удаления видео:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}

// Обновить видео
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("id");

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: "ID видео обязателен" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateVideoSchema.parse(body);

    const video = await prisma.video.update({
      where: { id: videoId },
      data: validatedData,
      include: {
        course: {
          select: { id: true, title: true },
        },
      },
    });

    // Обновляем длительность курса если изменилась duration
    if (validatedData.duration !== undefined) {
      await updateCourseDuration(video.courseId);
    }

    return NextResponse.json({
      success: true,
      data: video,
    });
  } catch (error) {
    console.error("Ошибка обновления видео:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
