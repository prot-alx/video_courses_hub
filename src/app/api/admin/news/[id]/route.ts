import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { UpdateNewsSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const news = await prisma.news.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            displayName: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!news) {
      return NextResponse.json(
        {
          success: false,
          error: "Новость не найдена",
        },
        { status: 404 }
      );
    }

    const response: ApiResponse<typeof news> = {
      success: true,
      data: news,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Ошибка при получении новости:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Ошибка при получении новости",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Валидация данных
    const validatedData = UpdateNewsSchema.parse(body);

    const news = await prisma.news.update({
      where: { id },
      data: {
        ...(validatedData.title !== undefined && {
          title: validatedData.title,
        }),
        ...(validatedData.shortDescription !== undefined && {
          shortDescription: validatedData.shortDescription,
        }),
        ...(validatedData.fullDescription !== undefined && {
          fullDescription: validatedData.fullDescription,
        }),
        ...(validatedData.image !== undefined && {
          image: validatedData.image,
        }),
        ...(validatedData.isActive !== undefined && {
          isActive: validatedData.isActive,
        }),
      },
      include: {
        author: {
          select: {
            displayName: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const response: ApiResponse<typeof news> = {
      success: true,
      data: news,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Ошибка при обновлении новости:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Неверные данные новости" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Ошибка при обновлении новости",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.news.delete({
      where: { id },
    });

    const response: ApiResponse<null> = {
      success: true,
      data: null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Ошибка при удалении новости:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Ошибка при удалении новости",
      },
      { status: 500 }
    );
  }
}
