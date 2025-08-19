import Link from "next/link";

interface CourseActionsProps {
  courseId: string;
  onDelete: (courseId: string) => void;
  isLoading?: boolean;
}

export default function CourseActions({
  courseId,
  onDelete,
  isLoading = false,
}: Readonly<CourseActionsProps>) {
  const handleDelete = () => {
    if (confirm("Удалить этот курс? Действие нельзя отменить.")) {
      onDelete(courseId);
    }
  };

  return (
    <div className="flex gap-2">
      <Link
        href={`/admin/courses/${courseId}`}
        className="text-sm px-2 py-1 rounded hover:opacity-80"
        style={{ color: "var(--color-text-link)" }}
      >
        Редактировать
      </Link>

      <button
        onClick={handleDelete}
        disabled={isLoading}
        className="text-sm px-2 py-1 rounded hover:opacity-80 disabled:opacity-50"
        style={{ color: "var(--color-danger)" }}
      >
        {isLoading ? "Удаляем..." : "Удалить"}
      </button>
    </div>
  );
}
