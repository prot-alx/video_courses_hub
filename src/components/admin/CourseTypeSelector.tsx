import { CourseFormData } from "@/types";

interface CourseTypeSelectorProps {
  formData: CourseFormData;
  onFormDataChange: (updates: Partial<CourseFormData>) => void;
  isSubmitting: boolean;
  validationErrors?: Record<string, string>;
}

export default function CourseTypeSelector({
  formData,
  onFormDataChange,
  isSubmitting,
  validationErrors = {},
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
            max="999999"
            step="1"
            className={`w-full input-discord ${
              validationErrors.price ? "border-red-500" : ""
            }`}
            style={{
              borderColor: validationErrors.price
                ? "#ef4444"
                : undefined,
            }}
            disabled={isSubmitting}
            required={!formData.isFree}
          />
          {validationErrors.price && (
            <p className="text-xs text-red-500 mt-1">
              {validationErrors.price}
            </p>
          )}
          <p
            className="text-xs mt-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Цена в рублях (от 1 до 999,999)
          </p>
        </div>
      )}
    </>
  );
}
