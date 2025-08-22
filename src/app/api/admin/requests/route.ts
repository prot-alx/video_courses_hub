import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { RequestStatus } from "@/types";
import type { Prisma } from "@prisma/client";

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

    // Параметры фильтрации
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

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

    const requests = await prisma.courseRequest.findMany({
      where: whereClause as Prisma.CourseRequestWhereInput,
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
      take: limit,
    });

    // Группируем заявки по статусу для удобства
    const groupedRequests = {
      new: requests.filter((r) => r.status === "new"),
      approved: requests.filter((r) => r.status === "approved"),
      rejected: requests.filter((r) => r.status === "rejected"),
      cancelled: requests.filter((r) => r.status === "cancelled"),
    };

    const stats = {
      total: requests.length,
      new: groupedRequests.new.length,
      approved: groupedRequests.approved.length,
      rejected: groupedRequests.rejected.length,
      cancelled: groupedRequests.cancelled.length,
    };

    return NextResponse.json({
      success: true,
      data: {
        requests,
        grouped: groupedRequests,
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
