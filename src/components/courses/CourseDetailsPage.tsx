import Link from "next/link";
import CourseVideoSection from "./CourseVideoSection";
import CourseDetails from "./CourseDetails";
import CourseVideoList from "./CourseVideoList";
import { useCourseData } from "@/lib/hooks/useCourseData";

interface CourseDetailsPageProps {
  courseId: string;
}

export default function CourseDetailsPage({
  courseId,
}: Readonly<CourseDetailsPageProps>) {
  const {
    course,
    selectedVideo,
    selectedVideoDetails,
    requestStatus,
    loading,
    loadingVideoDetails,
    requestLoading,
    error,
    selectVideo,
    handlePurchaseRequest,
    handleCancelRequest,
    getVideoAccess,
    getThumbnailUrl,
    getSortedVideos,
  } = useCourseData({ courseId });

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "var(--color-primary-200)" }}
      >
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "var(--color-primary-200)" }}
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Курс не найден
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/" className="btn-discord btn-discord-primary">
              Вернуться к курсам
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sortedVideos = getSortedVideos();

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
          <Link href="/courses" className="btn-discord btn-discord-secondary">
            ← Назад к курсам
          </Link>
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            📚 VideoCourses
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - плеер и информация о курсе */}
          <div className="lg:col-span-2">
            {/* Видео плеер */}
            <CourseVideoSection
              course={course}
              selectedVideo={selectedVideo}
              selectedVideoDetails={selectedVideoDetails}
              loadingVideoDetails={loadingVideoDetails}
              getVideoAccess={getVideoAccess}
              getThumbnailUrl={getThumbnailUrl}
            />

            {/* Информация о курсе */}
            <CourseDetails
              course={course}
              requestStatus={requestStatus}
              requestLoading={requestLoading}
              onPurchaseRequest={handlePurchaseRequest}
              onCancelRequest={handleCancelRequest}
            />
          </div>

          {/* Правая колонка - список видео */}
          <div className="lg:col-span-1">
            <CourseVideoList
              videos={sortedVideos}
              selectedVideo={selectedVideo}
              getVideoAccess={getVideoAccess}
              onVideoSelect={selectVideo}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
