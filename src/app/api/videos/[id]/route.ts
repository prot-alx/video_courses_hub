// app/api/videos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: videoId } = await params;

    // Получаем видео с информацией о курсе
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        title: true,
        displayName: true,
        description: true, // Добавляем description
        filename: true,
        duration: true,
        isFree: true,
        orderIndex: true,
        course: {
          select: {
            id: true,
            title: true,
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
      return NextResponse.json(
        { success: false, error: "Видео не найдено" },
        { status: 404 }
      );
    }

    // Проверяем доступ к видео
    const hasAccess =
      video.isFree || // Видео бесплатное
      video.course.isFree || // Курс бесплатный
      (session?.user?.id && video.course.userAccess.length > 0); // Есть доступ к курсу

    // Формируем ответ
    const videoData = {
      id: video.id,
      title: video.displayName || video.title, // Приоритет displayName
      description: video.description, // Добавляем описание
      duration: video.duration,
      isFree: video.isFree,
      orderIndex: video.orderIndex,
      courseId: video.course.id,
      courseTitle: video.course.title,
      hasAccess,
      videoUrl: hasAccess ? video.filename : null, // URL только если есть доступ
    };

    return NextResponse.json({
      success: true,
      data: videoData,
    });
  } catch (error) {
    console.error("Ошибка получения видео:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
