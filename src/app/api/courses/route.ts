import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GetCoursesSchema } from "@/lib/validations";
import type { CourseFilterType } from "@/types";
import type { Prisma } from "@prisma/client";

interface CourseWhereClause {
  isActive: boolean;
  isFree?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";
    const { searchParams } = new URL(request.url);

    // Валидация параметров
    const typeParam = searchParams.get("type") || "all";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const validatedParams = GetCoursesSchema.parse({ type: typeParam });

    // Типизированные фильтры для типов курсов
    const whereClause: CourseWhereClause = {
      isActive: true,
    };

    // Используем наш централизованный тип CourseFilterType
    const filterType = validatedParams.type as CourseFilterType;

    switch (filterType) {
      case "free":
        whereClause.isFree = true;
        break;
      case "paid":
        whereClause.isFree = false;
        break;
      case "featured":
        // Для featured показываем только курсы с ценой > 0 (премиум курсы)
        whereClause.isFree = false;
        break;
      case "all":
      default:
        // Не добавляем фильтр по isFree
        break;
    }

    const courses = await prisma.course.findMany({
      where: whereClause as Prisma.CourseWhereInput,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        isFree: true,
        thumbnail: true,
        totalDuration: true,
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
        orderIndex: "asc",
      },
      ...(limit && { take: limit }),
    });

    // Создаем Set для быстрого поиска доступа пользователя
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
        hasAccess,
        videosCount: course._count.videos,
        freeVideosCount,
        totalDuration: course.totalDuration,
        thumbnail: course.thumbnail,
        videos: [],
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
