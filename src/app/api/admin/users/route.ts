import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/users - получить всех пользователей с пагинацией
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Проверка админских прав
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    // Параметры пагинации
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          displayName: true,
          email: true,
          role: true,
          phone: true,
          telegram: true,
          preferredContact: true,
          createdAt: true,
          _count: {
            select: {
              courseAccess: true,
              courseRequests: {
                where: {
                  status: "new",
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    // Преобразуем данные для фронтенда
    const usersWithStats = users.map((user) => ({
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      telegram: user.telegram,
      preferredContact: user.preferredContact,
      createdAt: user.createdAt.toISOString(),
      coursesAccess: user._count.courseAccess,
      activeRequests: user._count.courseRequests,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Ошибка получения пользователей:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
