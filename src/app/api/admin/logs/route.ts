import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// GET /api/admin/logs - получить логи для админа
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
    const action = searchParams.get("action");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const whereClause: Prisma.SimpleLogWhereInput = {};

    // Фильтр по действию
    if (action) {
      whereClause.action = {
        contains: action,
        mode: "insensitive",
      };
    }

    // Поиск по деталям или действию
    if (search) {
      whereClause.OR = [
        {
          action: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          details: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Фильтр по датам
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Добавляем время до конца дня
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = endDate;
      }
    }

    const [logs, total] = await Promise.all([
      prisma.simpleLog.findMany({
        where: whereClause,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.simpleLog.count({
        where: whereClause,
      }),
    ]);

    // Получаем уникальные действия для фильтра
    const uniqueActions = await prisma.simpleLog.findMany({
      select: {
        action: true,
      },
      distinct: ["action"],
      orderBy: {
        action: "asc",
      },
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          current: page,
          total: totalPages,
          totalItems: total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        filters: {
          actions: uniqueActions.map(item => item.action),
        },
      },
    });
  } catch (error) {
    console.error("Ошибка получения логов:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}