import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [news, totalCount] = await Promise.all([
      prisma.news.findMany({
        where: { isActive: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          shortDescription: true,
          image: true,
          createdAt: true,
        },
      }),
      prisma.news.count({
        where: { isActive: true },
      }),
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
