import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

// GET - получение одобренных отзывов
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        status: "approved",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: reviews,
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