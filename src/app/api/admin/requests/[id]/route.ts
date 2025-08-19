import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProcessRequestSchema } from "@/lib/validations";

// PATCH /api/admin/requests/[id] - обработать заявку (одобрить/отклонить)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Проверка админских прав
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const { id: requestId } = await params;
    const body = await request.json();

    // Валидация данных
    const { status } = ProcessRequestSchema.parse(body);

    // Проверяем существование заявки
    const existingRequest = await prisma.courseRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: "Заявка не найдена" },
        { status: 404 }
      );
    }

    if (existingRequest.status !== "new") {
      return NextResponse.json(
        { success: false, error: "Заявка уже обработана" },
        { status: 400 }
      );
    }

    // Обновляем статус заявки
    const updatedRequest = await prisma.courseRequest.update({
      where: { id: requestId },
      data: {
        status,
        processedAt: new Date(),
        processedBy: session.user.id,
      },
    });

    // Если заявка одобрена, выдаем доступ к курсу
    if (status === "approved") {
      // Проверяем, нет ли уже доступа
      const existingAccess = await prisma.userCourseAccess.findUnique({
        where: {
          userId_courseId: {
            userId: existingRequest.userId,
            courseId: existingRequest.courseId,
          },
        },
      });

      if (!existingAccess) {
        await prisma.userCourseAccess.create({
          data: {
            userId: existingRequest.userId,
            courseId: existingRequest.courseId,
            grantedBy: session.user.id,
          },
        });
      }

      // Логируем выдачу доступа
      await prisma.simpleLog.create({
        data: {
          action: "access_granted",
          details: `Админ ${session.user.email} одобрил заявку и выдал доступ пользователю ${existingRequest.user.email} к курсу "${existingRequest.course.title}"`,
        },
      });
    } else {
      // Логируем отклонение
      await prisma.simpleLog.create({
        data: {
          action: "request_rejected",
          details: `Админ ${session.user.email} отклонил заявку пользователя ${existingRequest.user.email} на курс "${existingRequest.course.title}"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message:
        status === "approved"
          ? "Заявка одобрена, доступ выдан"
          : "Заявка отклонена",
    });
  } catch (error) {
    console.error("Ошибка обработки заявки:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Неверные данные запроса" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// GET /api/admin/requests/[id] - получить детали заявки
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Проверка админских прав
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const { id: requestId } = await params;

    const courseRequest = await prisma.courseRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            telegram: true,
            preferredContact: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            isFree: true,
          },
        },
        processedByUser: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!courseRequest) {
      return NextResponse.json(
        { success: false, error: "Заявка не найдена" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: courseRequest,
    });
  } catch (error) {
    console.error("Ошибка получения заявки:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
