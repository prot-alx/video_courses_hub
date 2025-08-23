import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - получение всех отзывов для админа
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Доступ запрещен",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const whereClause = status ? { status: status as "pending" | "approved" | "rejected" } : {};

    const [reviews, stats] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              name: true,
              displayName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.review.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    // Формируем статистику
    const statsObject = stats.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: reviews,
      stats: {
        pending: statsObject.pending || 0,
        approved: statsObject.approved || 0,
        rejected: statsObject.rejected || 0,
        total: reviews.length,
      },
    });
  } catch (error) {
    console.error("Ошибка получения отзывов:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Ошибка получения отзывов",
      },
      { status: 500 }
    );
  }
}