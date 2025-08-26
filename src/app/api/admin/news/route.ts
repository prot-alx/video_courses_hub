import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CreateNewsSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [news, totalCount] = await Promise.all([
      prisma.news.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              displayName: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.news.count(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const response: ApiResponse<{
      news: typeof news;
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        hasMore: boolean;
      };
    }> = {
      success: true,
      data: {
        news,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasMore: page < totalPages,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Ошибка при получении новостей:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Ошибка при получении новостей",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Валидация данных
    const validatedData = CreateNewsSchema.parse(body);

    const news = await prisma.news.create({
      data: {
        title: validatedData.title,
        shortDescription: validatedData.shortDescription,
        fullDescription: validatedData.fullDescription,
        image: validatedData.image,
        isActive: validatedData.isActive,
        createdBy: session.user.id,
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
    console.error("Ошибка при создании новости:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Неверные данные новости" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Ошибка при создании новости",
      },
      { status: 500 }
    );
  }
}
