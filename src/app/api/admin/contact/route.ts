// src/app/api/admin/contact/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/contact - получить Telegram админа для связи
export async function GET() {
  try {
    const admin = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
        telegram: {
          not: null,
        },
      },
      select: {
        telegram: true,
      },
    });

    if (!admin || !admin.telegram) {
      return NextResponse.json(
        { success: false, error: "Telegram администратора не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        telegram: admin.telegram,
      },
    });
  } catch (error) {
    console.error("Ошибка получения контактов админа:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
