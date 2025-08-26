import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReorderVideosSchema } from "@/lib/validations";
import { ZodError } from "zod";

// PUT /api/admin/videos/reorder - изменить порядок видео
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = ReorderVideosSchema.parse(body);

    // Обновляем порядок видео в транзакции
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < validatedData.videoIds.length; i++) {
        await tx.video.update({
          where: { id: validatedData.videoIds[i] },
          data: { orderIndex: i },
        });
      }
    });

    // Логируем действие
    await prisma.simpleLog.create({
      data: {
        action: "videos_reordered",
        details: `Порядок видео изменен администратором ${
          session.user.email
        }. Новый порядок: ${validatedData.videoIds.join(", ")}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Порядок видео обновлен",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues[0]?.message || "Неверные данные",
        },
        { status: 400 }
      );
    }

    console.error("Ошибка изменения порядка видео:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
