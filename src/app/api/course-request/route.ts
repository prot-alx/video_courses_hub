// course-request/route.ts
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { CourseRequestSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

// POST /api/course-request - создать заявку на покупку
export async function POST(request: NextRequest) {
  try {
    // Проверка авторизации
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Необходима авторизация" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    // Валидация данных
    const { courseId, contactMethod } = CourseRequestSchema.parse(body);

    // Проверяем, существует ли курс и является ли он платным
    const course = await prisma.course.findUnique({
      where: { id: courseId, isActive: true },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Курс не найден" },
        { status: 404 }
      );
    }

    if (course.isFree) {
      return NextResponse.json(
        { success: false, error: "Курс бесплатный, заявка не нужна" },
        { status: 400 }
      );
    }

    // Проверяем, нет ли у пользователя уже доступа к курсу
    const existingAccess = await prisma.userCourseAccess.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingAccess) {
      return NextResponse.json(
        { success: false, error: "У вас уже есть доступ к этому курсу" },
        { status: 400 }
      );
    }

    // Проверяем существующую заявку
    const existingRequest = await prisma.courseRequest.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    // Если есть активная заявка - блокируем
    if (existingRequest && existingRequest.status === "new") {
      return NextResponse.json(
        {
          success: false,
          error: "У вас уже есть активная заявка на этот курс",
        },
        { status: 400 }
      );
    }

    if (existingRequest && existingRequest.status === "approved") {
      return NextResponse.json(
        { success: false, error: "Ваша заявка уже одобрена" },
        { status: 400 }
      );
    }

    // Создаем или обновляем заявку
    const courseRequest = await prisma.courseRequest.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      create: {
        userId,
        courseId,
        contactMethod,
        status: "new",
      },
      update: {
        contactMethod,
        status: "new",
        createdAt: new Date(),
        processedAt: null,
        processedBy: null,
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Логируем создание заявки
    await prisma.simpleLog.create({
      data: {
        action: "course_request_created",
        details: `Пользователь ${session.user.email} отправил заявку на курс "${course.title}" (ID: ${courseId})`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: courseRequest.id,
        status: courseRequest.status,
        createdAt: courseRequest.createdAt,
        course: courseRequest.course,
        message: "Заявка отправлена администратору",
      },
    });
  } catch (error) {
    console.error("Ошибка создания заявки:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Неверные данные заявки" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// DELETE /api/course-request - отменить заявку
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Необходима авторизация" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "ID курса обязателен" },
        { status: 400 }
      );
    }

    // Ищем активную заявку пользователя
    const activeRequest = await prisma.courseRequest.findFirst({
      where: {
        userId,
        courseId,
        status: "new",
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!activeRequest) {
      return NextResponse.json(
        { success: false, error: "Активная заявка не найдена" },
        { status: 404 }
      );
    }

    // Отменяем заявку
    await prisma.courseRequest.update({
      where: {
        id: activeRequest.id,
      },
      data: {
        status: "cancelled",
        processedAt: new Date(),
      },
    });

    // Логируем отмену
    await prisma.simpleLog.create({
      data: {
        action: "course_request_cancelled",
        details: `Пользователь ${session.user.email} отменил заявку на курс "${activeRequest.course.title}" (ID: ${courseId})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Заявка отменена",
    });
  } catch (error) {
    console.error("Ошибка отмены заявки:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
