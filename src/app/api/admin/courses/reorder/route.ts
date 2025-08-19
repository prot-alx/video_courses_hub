// app/api/admin/courses/reorder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ReorderCoursesSchema = z.object({
  courseIds: z.array(z.string()).min(1, "Список курсов не может быть пустым"),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { courseIds } = ReorderCoursesSchema.parse(body);

    // Проверяем, что все курсы существуют
    const existingCourses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true },
    });

    if (existingCourses.length !== courseIds.length) {
      return NextResponse.json(
        { success: false, error: "Некоторые курсы не найдены" },
        { status: 400 }
      );
    }

    // Обновляем orderIndex для каждого курса
    const updatePromises = courseIds.map((courseId, index) =>
      prisma.course.update({
        where: { id: courseId },
        data: { orderIndex: index },
      })
    );

    await Promise.all(updatePromises);

    // Логируем действие
    await prisma.simpleLog.create({
      data: {
        action: "courses_reordered",
        details: `Администратор ${
          session.user.email
        } изменил порядок курсов: ${courseIds.join(", ")}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Порядок курсов обновлен",
    });
  } catch (error) {
    console.error("Ошибка изменения порядка курсов:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Неверные данные запроса" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
