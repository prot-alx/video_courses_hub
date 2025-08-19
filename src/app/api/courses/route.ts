// app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GetCoursesSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";
    const { searchParams } = new URL(request.url);

    // Валидация параметров
    const typeParam = searchParams.get("type") || "all";
    const validatedParams = GetCoursesSchema.parse({ type: typeParam });

    // Фильтры для типов курсов
    const whereClause: any = {
      isActive: true, // Показываем только активные курсы
    };

    if (validatedParams.type === "free") {
      whereClause.isFree = true;
    } else if (validatedParams.type === "paid") {
      whereClause.isFree = false;
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        isFree: true,
        thumbnail: true,
        totalDuration: true, // ← ДОБАВЛЯЕМ это поле
        videos: {
          select: {
            id: true,
            isFree: true,
          },
        },
        userAccess: session?.user?.id
          ? {
              where: { userId: session.user.id },
              select: { userId: true },
            }
          : false,
        _count: {
          select: {
            videos: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Создаем Map для быстрого поиска доступа пользователя
    const userAccessMap = new Set(
      courses.flatMap((course) =>
        Array.isArray(course.userAccess)
          ? course.userAccess.map(() => course.id)
          : []
      )
    );

    // Преобразуем данные для фронтенда
    const coursesWithAccess = courses.map((course) => {
      // Для админа - доступ ко всем курсам
      const hasAccess =
        isAdmin || course.isFree || userAccessMap.has(course.id);

      const freeVideosCount = course.videos.filter(
        (video) => video.isFree
      ).length;

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        isFree: course.isFree,
        hasAccess, // Админу всегда true
        videosCount: course._count.videos,
        freeVideosCount,
        totalDuration: course.totalDuration, // ← Возвращаем точное время
        thumbnail: course.thumbnail,
      };
    });

    return NextResponse.json({
      success: true,
      data: coursesWithAccess,
    });
  } catch (error) {
    console.error("Ошибка получения курсов:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
