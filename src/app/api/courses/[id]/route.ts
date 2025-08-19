// app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/courses/[id] - получить детали курса
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;

    // Получение сессии для проверки доступа
    const session = await auth();
    const userId = session?.user?.id;
    const isAdmin = session?.user?.role === "ADMIN";

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        isActive: true,
      },
      include: {
        videos: {
          select: {
            id: true,
            title: true,
            displayName: true,
            description: true,
            isFree: true,
            duration: true,
            orderIndex: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
        // Если пользователь авторизован, проверяем его доступ
        userAccess: userId
          ? {
              where: {
                userId: userId,
              },
            }
          : false,
        _count: {
          select: {
            videos: true,
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

    // Проверяем доступ пользователя к курсу
    let hasAccess = course.isFree;
    if (userId && !hasAccess) {
      if (isAdmin) {
        // Админу доступны все курсы автоматически
        hasAccess = true;
      } else {
        // Для обычных пользователей проверяем в таблице доступа
        hasAccess = course.userAccess && course.userAccess.length > 0;
      }
    }

    const freeVideosCount = course.videos.filter((v) => v.isFree).length;

    const courseData = {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      isFree: course.isFree,
      thumbnail: course.thumbnail,
      hasAccess,
      videosCount: course._count.videos,
      freeVideosCount,
      videos: course.videos.map((video) => ({
        id: video.id,
        title: video.displayName || video.title,
        isFree: video.isFree,
        duration: video.duration,
        orderIndex: video.orderIndex,
        hasAccess: isAdmin || video.isFree || hasAccess,
      })),
    };

    return NextResponse.json({
      success: true,
      data: courseData,
    });
  } catch (error) {
    console.error("Ошибка получения курса:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
