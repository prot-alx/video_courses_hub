import { CourseFormData } from "@/types";

interface CourseBasicInfoFormProps {
  formData: CourseFormData;
  onFormDataChange: (updates: Partial<CourseFormData>) => void;
  isSubmitting: boolean;
  validationErrors?: Record<string, string>;
}

export default function CourseBasicInfoForm({
  formData,
  onFormDataChange,
  isSubmitting,
  validationErrors = {},
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
          maxLength={100}
          className={`w-full px-3 py-2 rounded border ${
            validationErrors.title ? 'border-red-500' : ''
          }`}
          style={{
            background: "var(--color-primary-100)",
            borderColor: validationErrors.title ? "#ef4444" : "var(--color-primary-400)",
            color: "var(--color-primary-300)",
          }}
          disabled={isSubmitting}
          required
        />
        <div className="flex justify-between items-center mt-1">
          {validationErrors.title ? (
            <p className="text-xs text-red-500">{validationErrors.title}</p>
          ) : (
            <p
              className="text-xs"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Название, которое увидят пользователи
            </p>
          )}
          <span
            className={`text-xs ${formData.title.length > 90 ? 'text-orange-500' : formData.title.length > 100 ? 'text-red-500' : 'text-gray-500'}`}
          >
            {formData.title.length}/100
          </span>
        </div>
      </div>

      {/* Course Short Description */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Краткое описание
        </label>
        <textarea
          value={formData.shortDescription}
          onChange={(e) => onFormDataChange({ shortDescription: e.target.value })}
          placeholder="Краткое описание для отображения в карточке курса"
          maxLength={150}
          rows={3}
          className={`w-full px-3 py-2 rounded border resize-none ${
            validationErrors.shortDescription ? 'border-red-500' : ''
          }`}
          style={{
            background: "var(--color-primary-100)",
            borderColor: validationErrors.shortDescription ? "#ef4444" : "var(--color-primary-400)",
            color: "var(--color-primary-300)",
          }}
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-1">
          {validationErrors.shortDescription ? (
            <p className="text-xs text-red-500">{validationErrors.shortDescription}</p>
          ) : (
            <p
              className="text-xs"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Это описание будет показано в списке курсов
            </p>
          )}
          <span
            className={`text-xs ${formData.shortDescription.length > 130 ? 'text-orange-500' : formData.shortDescription.length > 150 ? 'text-red-500' : 'text-gray-500'}`}
          >
            {formData.shortDescription.length}/150
          </span>
        </div>
      </div>

      {/* Course Full Description */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Подробное описание
        </label>
        <textarea
          value={formData.fullDescription}
          onChange={(e) => onFormDataChange({ fullDescription: e.target.value })}
          placeholder="Подробное описание курса, что изучит студент..."
          maxLength={2000}
          rows={6}
          className={`w-full px-3 py-2 rounded border resize-none ${
            validationErrors.fullDescription ? 'border-red-500' : ''
          }`}
          style={{
            background: "var(--color-primary-100)",
            borderColor: validationErrors.fullDescription ? "#ef4444" : "var(--color-primary-400)",
            color: "var(--color-primary-300)",
          }}
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-1">
          {validationErrors.fullDescription ? (
            <p className="text-xs text-red-500">{validationErrors.fullDescription}</p>
          ) : (
            <p
              className="text-xs"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Детальное описание будет показано на странице курса
            </p>
          )}
          <span
            className={`text-xs ${formData.fullDescription.length > 1800 ? 'text-orange-500' : formData.fullDescription.length > 2000 ? 'text-red-500' : 'text-gray-500'}`}
          >
            {formData.fullDescription.length}/2000
          </span>
        </div>
      </div>
    </>
  );
}
