import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const statusFilter = searchParams.get("status"); // new, approved, rejected, cancelled
    const limit = parseInt(searchParams.get("limit") || "50");

    const whereClause: any = {};
    if (
      statusFilter &&
      ["new", "approved", "rejected", "cancelled"].includes(statusFilter)
    ) {
      whereClause.status = statusFilter;
    }

    const requests = await prisma.courseRequest.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            telegram: true,
            preferredContact: true, // ← Добавили это поле
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
      orderBy: [
        { status: "asc" }, // new первые
        { createdAt: "desc" },
      ],
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
