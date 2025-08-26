import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE - удаление своего отзыва
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Проверяем, принадлежит ли отзыв пользователю
    const review = await prisma.review.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          error: "Отзыв не найден или не принадлежит вам",
        },
        { status: 404 }
      );
    }

    await prisma.review.delete({
      where: {
        id,
      },
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
