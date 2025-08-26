import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const news = await prisma.news.findFirst({
      where: {
        id,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        shortDescription: true,
        fullDescription: true,
        image: true,
        createdAt: true,
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
