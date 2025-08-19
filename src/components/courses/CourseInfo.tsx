import PurchaseButton from "./PurchaseButton";

interface CourseInfoProps {
  course: {
    id: string;
    title: string;
    description: string;
    price: number | null;
    isFree: boolean;
    videosCount: number;
    totalDuration: number; // в секундах
  };
  hasAccess: boolean;
  isAuthenticated: boolean;
  requestStatus?: "none" | "pending" | "approved" | "rejected";
  isLoading?: boolean;
  onPurchase: (courseId: string) => void;
  onCancelRequest: (courseId: string) => void;
  onSignIn: () => void;
}

export default function CourseInfo({
  course,
  hasAccess,
  isAuthenticated,
  requestStatus,
  isLoading,
  onPurchase,
  onCancelRequest,
  onSignIn,
}: Readonly<CourseInfoProps>) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}ч ${minutes}м` : `${minutes}м`;
  };

  return (
    <div className="lg:col-span-2">
      <div
        className="p-6 rounded-lg border mb-6"
        style={{
          background: "var(--color-primary-300)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1
              className="text-3xl font-bold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              {course.title}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              {/* Цена/тип курса */}
              {course.isFree ? (
                <span
                  className="px-3 py-1 text-sm rounded-full font-medium"
                  style={{
                    background: "var(--color-success)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Бесплатно
                </span>
              ) : (
                <span
                  className="px-3 py-1 text-sm rounded-full font-medium"
                  style={{
                    background: "var(--color-warning)",
                    color: "var(--color-primary-300)",
                  }}
                >
                  {course.price}₽
                </span>
              )}

              {/* Метаинформация */}
              <span
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {course.videosCount} видео •{" "}
                {formatDuration(course.totalDuration)}
              </span>
            </div>
          </div>
        </div>

        {/* Описание */}
        <p
          className="text-base leading-relaxed mb-6"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {course.description}
        </p>

        {/* Кнопка покупки */}
        <PurchaseButton
          courseId={course.id}
          isFree={course.isFree}
          hasAccess={hasAccess}
          isAuthenticated={isAuthenticated}
          requestStatus={requestStatus}
          isLoading={isLoading}
          onPurchase={onPurchase}
          onCancelRequest={onCancelRequest}
          onSignIn={onSignIn}
        />
      </div>
    </div>
  );
}
