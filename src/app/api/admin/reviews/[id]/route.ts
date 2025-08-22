import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ModerationSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

// PATCH - модерация отзыва (одобрить/отклонить)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { status } = ModerationSchema.parse(body);

    // Проверяем существование отзыва
    const existingReview = await prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: "Отзыв не найден",
        },
        { status: 404 }
      );
    }

    // Обновляем статус отзыва
    const updatedReview = await prisma.review.update({
      where: { id },
      data: { status },
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
      data: updatedReview,
      message: `Отзыв ${
        status === "approved" ? "одобрен" : 
        status === "rejected" ? "отклонен" : 
        "возвращен на модерацию"
      }`,
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

    console.error("Ошибка модерации отзыва:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Ошибка модерации отзыва",
      },
      { status: 500 }
    );
  }
}

// DELETE - удаление отзыва админом
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Проверяем существование отзыва
    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: "Отзыв не найден",
        },
        { status: 404 }
      );
    }

    // Удаляем отзыв
    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Отзыв удален",
    });
  } catch (error) {
    console.error("Ошибка удаления отзыва:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Ошибка удаления отзыва",
      },
      { status: 500 }
    );
  }
}