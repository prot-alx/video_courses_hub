"use client";
import { use } from "react";
import Link from "next/link";
import { useCourseEdit } from "@/lib/hooks/useCourseEdit";
import LoadingState from "@/components/admin/LoadingState";
import ErrorState from "@/components/admin/ErrorState";
import CourseEditForm from "@/components/admin/CourseEditForm";
import VideoManagementSection from "@/components/admin/VideoManagementSection";

export default function EditCoursePage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const resolvedParams = use(params);
  const {
    course,
    formData,
    loading,
    isSubmitting,
    error,
    updateFormData,
    handleSubmit,
  } = useCourseEdit({ courseId: resolvedParams.id });

  if (loading) {
    return <LoadingState />;
  }

  if (error && !course) {
    return <ErrorState error={error} />;
  }

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
            ✏️ Редактирование курса
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <CourseEditForm
          formData={formData}
          onFormDataChange={updateFormData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />

        <VideoManagementSection courseId={resolvedParams.id} />
      </main>
    </div>
  );
}
