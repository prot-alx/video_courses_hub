import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToastContext } from "@/components/providers/ToastProvider";
import type { Course, RequestStatus } from "@/types";

interface CourseAccessManagerProps {
  course: Course;
  requestStatus: RequestStatus | null;
  requestLoading: boolean;
  onPurchaseRequest: () => Promise<void>;
  onCancelRequest: () => Promise<void>;
}

export default function CourseAccessManager({
  course,
  requestStatus,
  requestLoading,
  onPurchaseRequest,
  onCancelRequest,
}: Readonly<CourseAccessManagerProps>) {
  const { isAuthenticated, user } = useAuth();
  const toast = useToastContext();

  const handlePurchaseRequest = async () => {
    try {
      await onPurchaseRequest();
      toast.success(
        "Заявка отправлена!",
        "Администратор рассмотрит её в течение 24 часов. Если есть вопросы - напишите в Telegram через кнопку внизу экрана."
      );
    } catch (err) {
      console.log(err);
      toast.error(
        "Ошибка отправки",
        err instanceof Error ? err.message : "Ошибка отправки заявки"
      );
    }
  };

  const handleCancelRequest = async () => {
    try {
      await onCancelRequest();
      toast.success("Заявка отменена");
    } catch (err) {
      console.log(err);
      toast.error(
        "Ошибка отмены",
        err instanceof Error ? err.message : "Ошибка отмены заявки"
      );
    }
  };

  const renderActionButton = () => {
    const isAdmin = user?.role === "ADMIN";

    if (isAdmin) {
      return (
        <button className="btn-discord btn-discord-success">
          ✓ Админский доступ
        </button>
      );
    }

    if (course.isFree) {
      return (
        <button className="btn-discord btn-discord-success">
          🆓 Смотреть бесплатно
        </button>
      );
    }

    if (!isAuthenticated) {
      return (
        <Link href="/auth/signin" className="btn-discord btn-discord-primary">
          🔐 Войти для покупки
        </Link>
      );
    }

    if (course.hasAccess) {
      return (
        <button className="btn-discord btn-discord-success">
          🎥 Смотреть курс
        </button>
      );
    }

    if (requestStatus) {
      switch (requestStatus) {
        case "new":
          return (
            <button
              onClick={handleCancelRequest}
              disabled={requestLoading}
              className="btn-discord btn-discord-warning"
            >
              ⏳ Заявка на рассмотрении - Отменить
            </button>
          );
        case "approved":
          return (
            <button className="btn-discord btn-discord-success">
              🎥 Смотреть курс
            </button>
          );
        case "rejected":
          return (
            <button
              onClick={handlePurchaseRequest}
              disabled={requestLoading}
              className="btn-discord btn-discord-primary"
            >
              💰 Запросить доступ повторно
            </button>
          );
        default:
          return (
            <button
              onClick={handlePurchaseRequest}
              disabled={requestLoading}
              className="btn-discord btn-discord-primary"
            >
              💰 Запросить доступ к курсу
            </button>
          );
      }
    }

    return (
      <button
        onClick={handlePurchaseRequest}
        disabled={requestLoading}
        className="btn-discord btn-discord-primary"
      >
        💰 Запросить доступ к курсу
      </button>
    );
  };

  return renderActionButton();
}
