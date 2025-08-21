import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/contact - получить контакты поддержки
export async function GET() {
  try {
    // Сначала пробуем получить из настроек
    const settings = await prisma.adminSettings.findUnique({
      where: { id: "main" },
    });

    if (settings?.supportTelegram) {
      return NextResponse.json({
        success: true,
        data: {
          telegram: settings.supportTelegram,
          phone: settings.supportPhone,
          email: settings.supportEmail,
        },
      });
    }

    // Fallback: ищем админа с Telegram (для обратной совместимости)
    const admin = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
        telegram: {
          not: null,
        },
      },
      select: {
        telegram: true,
        name: true,
      },
    });

    if (!admin?.telegram) {
      return NextResponse.json(
        { success: false, error: "Контакт поддержки не настроен" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        telegram: admin.telegram,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error("Ошибка получения контактов поддержки:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/contact - обновить настройки поддержки
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { supportTelegram, supportPhone, supportEmail } = body;

    // Валидация: хотя бы один контакт должен быть указан
    if (
      !supportTelegram?.trim() &&
      !supportPhone?.trim() &&
      !supportEmail?.trim()
    ) {
      return NextResponse.json(
        { success: false, error: "Укажите хотя бы один способ связи" },
        { status: 400 }
      );
    }

    const settings = await prisma.adminSettings.upsert({
      where: { id: "main" },
      create: {
        id: "main",
        supportTelegram: supportTelegram?.trim() || null,
        supportPhone: supportPhone?.trim() || null,
        supportEmail: supportEmail?.trim() || null,
      },
      update: {
        supportTelegram: supportTelegram?.trim() || null,
        supportPhone: supportPhone?.trim() || null,
        supportEmail: supportEmail?.trim() || null,
      },
    });

    // Логируем изменение
    await prisma.simpleLog.create({
      data: {
        action: "support_contacts_updated",
        details: `Админ ${session.user.email} обновил контакты поддержки`,
      },
    });

    return NextResponse.json({
      success: true,
      data: settings,
      message: "Настройки поддержки обновлены",
    });
  } catch (error) {
    console.error("Ошибка обновления настроек поддержки:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
