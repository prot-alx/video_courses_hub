import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/users - получить всех пользователей
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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
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
    });

    // Преобразуем данные для фронтенда
    const usersWithStats = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      telegram: user.telegram,
      preferredContact: user.preferredContact,
      createdAt: user.createdAt.toISOString(),
      coursesAccess: user._count.courseAccess,
      activeRequests: user._count.courseRequests,
    }));

    return NextResponse.json({
      success: true,
      data: usersWithStats,
    });
  } catch (error) {
    console.error("Ошибка получения пользователей:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
