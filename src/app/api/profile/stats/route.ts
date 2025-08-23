// app/api/profile/stats/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        createdAt: true,
        courseAccess: {
          select: { courseId: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    const stats = {
      purchasedCourses: user.courseAccess.length,
      memberSince: user.createdAt.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Ошибка получения статистики:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
