import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  updateAllCoursesDuration,
  updateCourseDuration,
} from "@/lib/helpers/courseDuration";

// POST /api/admin/courses/recalculate-duration - пересчитать длительность всех курсов
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const { courseId } = await request.json().catch(() => ({}));

    if (courseId) {
      // Пересчитываем один курс
      const newDuration = await updateCourseDuration(courseId);
      return NextResponse.json({
        success: true,
        data: { courseId, duration: newDuration },
        message: "Длительность курса пересчитана",
      });
    } else {
      // Пересчитываем все курсы
      await updateAllCoursesDuration();
      return NextResponse.json({
        success: true,
        message: "Длительность всех курсов пересчитана",
      });
    }
  } catch (error) {
    console.error("Ошибка пересчета длительности:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
