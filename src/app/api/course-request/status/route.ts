import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/course-request/status?courseId=xxx - получить статус заявки для курса
export async function GET(request: NextRequest) {
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

    // Проверяем доступ к курсу
    const courseAccess = await prisma.userCourseAccess.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (courseAccess) {
      return NextResponse.json({
        success: true,
        data: {
          hasAccess: true,
          status: "access_granted",
          grantedAt: courseAccess.grantedAt,
        },
      });
    }

    // Проверяем активную заявку
    const activeRequest = await prisma.courseRequest.findFirst({
      where: {
        userId,
        courseId,
        status: {
          in: ["new", "approved", "rejected"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (activeRequest) {
      return NextResponse.json({
        success: true,
        data: {
          hasAccess: false,
          status: activeRequest.status,
          requestId: activeRequest.id,
          createdAt: activeRequest.createdAt,
          processedAt: activeRequest.processedAt,
          canCancel: activeRequest.status === "new",
        },
      });
    }

    // Проверяем, является ли курс бесплатным
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { isFree: true, isActive: true },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Курс не найден" },
        { status: 404 }
      );
    }

    if (!course.isActive) {
      return NextResponse.json(
        { success: false, error: "Курс неактивен" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        hasAccess: course.isFree,
        status: course.isFree ? "free_course" : "no_request",
        canRequest: !course.isFree,
      },
    });
  } catch (error) {
    console.error("Ошибка получения статуса заявки:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
