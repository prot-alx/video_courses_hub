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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const whereClause = status
      ? { status: status as "pending" | "approved" | "rejected" }
      : {};

    const [reviews, total, stats] = await Promise.all([
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
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: whereClause,
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

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      stats: {
        pending: statsObject.pending || 0,
        approved: statsObject.approved || 0,
        rejected: statsObject.rejected || 0,
        total:
          statsObject.pending + statsObject.approved + statsObject.rejected ||
          0,
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
