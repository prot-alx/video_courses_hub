interface CourseStatusToggleProps {
  isActive: boolean;
  onActiveChange: (isActive: boolean) => void;
  isSubmitting: boolean;
}

export default function CourseStatusToggle({
  isActive,
  onActiveChange,
  isSubmitting,
}: Readonly<CourseStatusToggleProps>) {
  return (
    <div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => onActiveChange(e.target.checked)}
          disabled={isSubmitting}
          className="w-4 h-4"
        />
        <span style={{ color: "var(--color-text-primary)" }}>
          Опубликовать курс сразу после создания
        </span>
      </label>
      <p
        className="text-sm mt-1"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Неопубликованные курсы не видны пользователям
      </p>
    </div>
  );
}
