// app/api/admin/courses/route.ts (обновленная версия с orderIndex)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateCourseSchema } from "@/lib/validations";

// GET /api/admin/courses - получить все курсы для админа
export async function GET() {
  try {
    const session = await auth();

    // Проверка админских прав
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const courses = await prisma.course.findMany({
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
            requests: {
              where: {
                status: "new",
              },
            },
          },
        },
      },
      orderBy: {
        orderIndex: "asc", // ← ИЗМЕНЕНО: сортируем по orderIndex вместо createdAt
      },
    });

    const coursesWithStats = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      isFree: course.isFree,
      isActive: course.isActive,
      thumbnail: course.thumbnail,
      totalDuration: course.totalDuration,
      orderIndex: course.orderIndex, // ← ДОБАВЛЕНО: включаем orderIndex в ответ
      createdAt: course.createdAt,
      videosCount: course._count.videos,
      usersWithAccess: course._count.userAccess,
      pendingRequests: course._count.requests,
      videos: course.videos,
    }));

    return NextResponse.json({
      success: true,
      data: coursesWithStats,
    });
  } catch (error) {
    console.error("Ошибка получения курсов для админа:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// POST /api/admin/courses - создать новый курс
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

    const body = await request.json();

    // Валидация данных
    const validatedData = CreateCourseSchema.parse(body);

    // Получаем следующий orderIndex
    const lastCourse = await prisma.course.findFirst({
      orderBy: { orderIndex: "desc" },
    });

    const nextOrderIndex = (lastCourse?.orderIndex ?? -1) + 1;

    // Создание курса
    const course = await prisma.course.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        price: validatedData.price || null,
        isFree: validatedData.isFree,
        isActive: validatedData.isActive,
        thumbnail: validatedData.thumbnail || null,
        orderIndex: nextOrderIndex, // ← ДОБАВЛЕНО: устанавливаем orderIndex
      },
    });

    // Логирование создания курса
    await prisma.simpleLog.create({
      data: {
        action: "course_created",
        details: `Админ ${session.user.email} создал курс "${course.title}" (ID: ${course.id})`,
      },
    });

    return NextResponse.json({
      success: true,
      data: course,
      message: "Курс успешно создан",
    });
  } catch (error) {
    console.error("Ошибка создания курса:", error);

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
