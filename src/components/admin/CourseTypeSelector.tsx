interface CourseFormData {
  title: string;
  description: string;
  price: string;
  isFree: boolean;
  isActive: boolean;
  thumbnail: string;
}

interface CourseTypeSelectorProps {
  formData: CourseFormData;
  onFormDataChange: (updates: Partial<CourseFormData>) => void;
  isSubmitting: boolean;
}

export default function CourseTypeSelector({
  formData,
  onFormDataChange,
  isSubmitting,
}: Readonly<CourseTypeSelectorProps>) {
  return (
    <>
      {/* Course Type */}
      <div>
        <label
          className="block text-sm font-medium mb-3"
          style={{ color: "var(--color-text-primary)" }}
        >
          Тип курса
        </label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="courseType"
              checked={formData.isFree}
              onChange={() => onFormDataChange({ isFree: true, price: "" })}
              disabled={isSubmitting}
              className="w-4 h-4"
            />
            <span style={{ color: "var(--color-text-primary)" }}>
              Бесплатный курс
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="courseType"
              checked={!formData.isFree}
              onChange={() => onFormDataChange({ isFree: false })}
              disabled={isSubmitting}
              className="w-4 h-4"
            />
            <span style={{ color: "var(--color-text-primary)" }}>
              Платный курс
            </span>
          </label>
        </div>
      </div>

      {/* Price */}
      {!formData.isFree && (
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Цена курса (₽) *
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => onFormDataChange({ price: e.target.value })}
            placeholder="2500"
            min="1"
            className="w-full px-3 py-2 rounded border"
            style={{
              background: "var(--color-primary-100)",
              borderColor: "var(--color-primary-400)",
              color: "var(--color-primary-300)",
            }}
            disabled={isSubmitting}
            required={!formData.isFree}
          />
        </div>
      )}
    </>
  );
}
