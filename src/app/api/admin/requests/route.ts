import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { RequestStatus } from "@/types";

interface RequestWhereClause {
  status?: RequestStatus;
}

// GET /api/admin/requests - получить все заявки для админа
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

    // Параметры фильтрации и пагинации
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const whereClause: RequestWhereClause = {};

    const validStatuses: RequestStatus[] = [
      "new",
      "approved",
      "rejected",
      "cancelled",
    ];

    if (statusFilter && validStatuses.includes(statusFilter as RequestStatus)) {
      whereClause.status = statusFilter as RequestStatus;
    }

    const [requests, total, allStats] = await Promise.all([
      prisma.courseRequest.findMany({
        where: whereClause as Prisma.CourseRequestWhereInput,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              displayName: true,
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
              price: true,
            },
          },
          processedByUser: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.courseRequest.count({
        where: whereClause as Prisma.CourseRequestWhereInput,
      }),
      prisma.courseRequest.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    // Формируем статистику из общих данных (а не только текущей страницы)
    const statsObject = allStats.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    const stats = {
      total:
        statsObject.new +
          statsObject.approved +
          statsObject.rejected +
          statsObject.cancelled || 0,
      new: statsObject.new || 0,
      approved: statsObject.approved || 0,
      rejected: statsObject.rejected || 0,
      cancelled: statsObject.cancelled || 0,
    };

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        requests,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        stats,
      },
    });
  } catch (error) {
    console.error("Ошибка получения заявок:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
