import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { ContactFormSchema } from "@/lib/validations";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация данных формы
    const validation = ContactFormSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Некорректные данные формы" },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validation.data;

    // Получаем email админа из настроек
    const settings = await prisma.adminSettings.findUnique({
      where: { id: "main" },
      select: { supportEmail: true },
    });

    if (!settings?.supportEmail) {
      return NextResponse.json(
        { success: false, error: "Email поддержки не настроен" },
        { status: 500 }
      );
    }

    // Определяем тему письма
    const subjectMap: Record<string, string> = {
      general: "Общий вопрос",
      courses: "Вопросы по курсам",
      enrollment: "Поступление", 
      technical: "Техническая поддержка",
      partnership: "Сотрудничество",
      other: "Другое"
    };

    const emailSubject = subject 
      ? `[Сайт] ${subjectMap[subject] || subject}` 
      : "[Сайт] Новое сообщение";

    // Отправляем письмо через Resend
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev", // Тестовый отправитель
      to: [settings.supportEmail],
      subject: emailSubject,
      html: `
        <h2>Новое сообщение с сайта</h2>
        <p><strong>Имя:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Тема:</strong> ${subject ? (subjectMap[subject] || subject) : "Не указана"}</p>
        <hr>
        <h3>Сообщение:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Отправлено: ${new Date().toLocaleString('ru-RU')}</small></p>
      `,
    });

    if (error) {
      console.error("Ошибка отправки письма:", error);
      return NextResponse.json(
        { success: false, error: "Не удалось отправить письмо" },
        { status: 500 }
      );
    }

    // Логируем отправку
    await prisma.simpleLog.create({
      data: {
        action: "contact_form_sent",
        details: `Отправлено письмо от ${email} (${name}) на тему: ${emailSubject}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Сообщение отправлено успешно",
      emailId: data?.id,
    });

  } catch (error) {
    console.error("Ошибка обработки формы обратной связи:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}