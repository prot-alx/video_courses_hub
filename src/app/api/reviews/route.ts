import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

// GET - получение одобренных отзывов с пагинацией
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId');
    const skip = (page - 1) * limit;

    // Получаем одобренные отзывы + pending отзывы для конкретного пользователя
    const where = {
      OR: [
        { status: "approved" as const },
        ...(userId ? [{ status: "pending" as const, userId }] : [])
      ]
    };

    // Отдельные условия для одобренных отзывов (для статистики)
    const approvedWhere = {
      status: "approved" as const,
    };

    // Получаем отзывы, общее количество и среднюю оценку параллельно
    const [reviews, total, approvedTotal, avgResult] = await Promise.all([
      prisma.review.findMany({
        where,
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
        where,
      }),
      prisma.review.count({
        where: approvedWhere,
      }),
      prisma.review.aggregate({
        where: approvedWhere,
        _avg: {
          rating: true,
        },
      })
    ]);

    const totalPages = Math.ceil(total / limit);
    const averageRating = avgResult._avg.rating ? Number(avgResult._avg.rating.toFixed(1)) : 0;

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
        approvedTotal, // количество только одобренных отзывов для заголовка
      },
      averageRating,
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

// POST - создание отзыва с защитой от спама
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Необходима авторизация",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rating, comment } = CreateReviewSchema.parse(body);

    // Проверяем, есть ли отзывы на модерации у пользователя
    const pendingReviews = await prisma.review.findMany({
      where: {
        userId: session.user.id,
        status: "pending",
      },
    });

    if (pendingReviews.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "У вас уже есть отзыв на модерации. Дождитесь его рассмотрения перед добавлением нового.",
        },
        { status: 400 }
      );
    }

    // Создаем новый отзыв
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        rating,
        comment,
        status: "pending",
      },
      include: {
        user: {
          select: {
            name: true,
            displayName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: "Отзыв отправлен на модерацию",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Неверные данные",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("Ошибка создания отзыва:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Ошибка создания отзыва",
      },
      { status: 500 }
    );
  }
}

// Добавляем новый эндпоинт для удаления конкретного отзыва