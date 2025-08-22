import { formatCourseDuration } from "@/lib/utils";
import CourseAccessManager from "./CourseAccessManager";
import type { Course } from "@/types/course";
import type { RequestStatus } from "@/types";

interface CourseDetailsProps {
  course: Course;
  requestStatus: RequestStatus | null;
  requestLoading: boolean;
  onPurchaseRequest: () => Promise<void>;
  onCancelRequest: () => Promise<void>;
}

export default function CourseDetails({
  course,
  requestStatus,
  requestLoading,
  onPurchaseRequest,
  onCancelRequest,
}: Readonly<CourseDetailsProps>) {
  return (
    <div
      className="p-6 rounded-lg border"
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            {course.title}
          </h1>
          <div className="flex items-center gap-4 mb-4">
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
            <span
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {course.videos.length} видео •{" "}
              {formatCourseDuration(course.videos, "short")}
            </span>
          </div>
        </div>
      </div>

      <p
        className="text-base leading-relaxed mb-6"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {course.description}
      </p>

      <CourseAccessManager
        course={course}
        requestStatus={requestStatus}
        requestLoading={requestLoading}
        onPurchaseRequest={onPurchaseRequest}
        onCancelRequest={onCancelRequest}
      />
    </div>
  );
}
