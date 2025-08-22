"use client";
import Link from "next/link";
import { useCourseCreation } from "@/lib/hooks/useCourseCreation";
import CourseBasicInfoForm from "@/components/admin/CourseBasicInfoForm";
import ThumbnailUploader from "@/components/admin/ThumbnailUploader";
import CourseTypeSelector from "@/components/admin/CourseTypeSelector";
import CourseStatusToggle from "@/components/admin/CourseStatusToggle";
import NextStepsInfo from "@/components/admin/NextStepsInfo";

export default function CreateCoursePage() {
  const { formData, isSubmitting, error, updateFormData, handleSubmit } =
    useCourseCreation();

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-primary-200)" }}
    >
      {/* Header */}
      <header
        className="border-b px-6 py-4"
        style={{
          background: "var(--color-primary-300)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="btn-discord btn-discord-secondary">
            ← К курсам
          </Link>
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            ➕ Создание нового курса
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50">
            <p className="text-red-800 text-sm">❌ {error}</p>
          </div>
        )}

        <div
          className="p-6 rounded-lg border"
          style={{
            background: "var(--color-primary-300)",
            borderColor: "var(--color-primary-400)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <CourseBasicInfoForm
              formData={formData}
              onFormDataChange={updateFormData}
              isSubmitting={isSubmitting}
            />

            <ThumbnailUploader
              thumbnail={formData.thumbnail}
              onThumbnailUpdated={(filename) =>
                updateFormData({ thumbnail: filename })
              }
              isSubmitting={isSubmitting}
            />

            <CourseTypeSelector
              formData={formData}
              onFormDataChange={updateFormData}
              isSubmitting={isSubmitting}
            />

            <CourseStatusToggle
              isActive={formData.isActive}
              onActiveChange={(isActive) => updateFormData({ isActive })}
              isSubmitting={isSubmitting}
            />

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-discord btn-discord-primary disabled:opacity-50"
              >
                {isSubmitting ? "Создаем..." : "Создать курс"}
              </button>
              <Link href="/admin" className="btn-discord btn-discord-secondary">
                Отмена
              </Link>
            </div>
          </form>
        </div>

        <NextStepsInfo />
      </main>
    </div>
  );
}
