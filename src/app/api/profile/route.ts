// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UpdateProfileSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        telegram: true,
        preferredContact: true,
        role: true,
        createdAt: true,
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...user,
          phone: user.phone || "",
          telegram: user.telegram || "",
          name: user.name || "",
        },
        reviews: user.reviews, // Все отзывы пользователя
      },
    });
  } catch (error) {
    console.error("Ошибка получения профиля:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = UpdateProfileSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        phone: validatedData.phone || null,
        telegram: validatedData.telegram || null,
        preferredContact: validatedData.preferredContact,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        telegram: true,
        preferredContact: true,
      },
    });

    return NextResponse.json({
      user: {
        ...updatedUser,
        phone: updatedUser.phone || "",
        telegram: updatedUser.telegram || "",
        name: updatedUser.name || "",
      },
    });
  } catch (error) {
    console.error("Ошибка обновления профиля:", error);
    return NextResponse.json(
      { error: "Ошибка обновления профиля" },
      { status: 500 }
    );
  }
}
