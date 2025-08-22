interface CourseFormData {
  title: string;
  description: string;
  price: string;
  isFree: boolean;
  isActive: boolean;
  thumbnail: string;
}

interface CourseBasicInfoFormProps {
  formData: CourseFormData;
  onFormDataChange: (updates: Partial<CourseFormData>) => void;
  isSubmitting: boolean;
}

export default function CourseBasicInfoForm({
  formData,
  onFormDataChange,
  isSubmitting,
}: Readonly<CourseBasicInfoFormProps>) {
  return (
    <>
      {/* Course Title */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Название курса *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onFormDataChange({ title: e.target.value })}
          placeholder="Например: Основы React"
          className="w-full px-3 py-2 rounded border"
          style={{
            background: "var(--color-primary-100)",
            borderColor: "var(--color-primary-400)",
            color: "var(--color-primary-300)",
          }}
          disabled={isSubmitting}
          required
        />
      </div>

      {/* Course Description */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Описание курса
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onFormDataChange({ description: e.target.value })}
          placeholder="Подробное описание курса, что изучит студент..."
          rows={4}
          className="w-full px-3 py-2 rounded border resize-none"
          style={{
            background: "var(--color-primary-100)",
            borderColor: "var(--color-primary-400)",
            color: "var(--color-primary-300)",
          }}
          disabled={isSubmitting}
        />
      </div>
    </>
  );
}
