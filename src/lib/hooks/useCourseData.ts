import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCourseRequest } from "@/lib/hooks/useApi";
import type { Course, Video, RequestStatus } from "@/types";

interface UseCourseDataProps {
  courseId: string;
}

interface UseCourseDataReturn {
  // Data
  course: Course | null;
  selectedVideo: Video | null;
  selectedVideoDetails: Video | null;
  requestStatus: RequestStatus | null;

  // Loading states
  loading: boolean;
  loadingVideoDetails: boolean;
  requestLoading: boolean;

  // Error states
  error: string | null;

  // Actions
  selectVideo: (video: Video) => void;
  handlePurchaseRequest: () => Promise<void>;
  handleCancelRequest: () => Promise<void>;
  refetchCourse: () => Promise<void>;

  // Utils
  getVideoAccess: (video: Video) => boolean;
  getThumbnailUrl: (thumbnail: string | null) => string | null;
  getSortedVideos: () => Video[];
}

export function useCourseData({
  courseId,
}: UseCourseDataProps): UseCourseDataReturn {
  const { isAuthenticated, user } = useAuth();
  const {
    createRequest,
    cancelRequest,
    getRequestStatus,
    loading: requestLoading,
  } = useCourseRequest();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState<RequestStatus | null>(
    null
  );
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedVideoDetails, setSelectedVideoDetails] =
    useState<Video | null>(null);
  const [loadingVideoDetails, setLoadingVideoDetails] = useState(false);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}`);
      const data = await response.json();

      if (data.success) {
        setCourse(data.data);
        setError(null);

        // Автоматически выбираем первое доступное видео
        const sortedVideos = [...(data.data.videos || [])].sort(
          (a, b) => a.orderIndex - b.orderIndex
        );
        const firstAccessible = sortedVideos.find((video: Video) => {
          if (data.data.isFree || data.data.hasAccess || user?.role === "ADMIN")
            return true;
          return video.isFree;
        });

        if (firstAccessible) {
          setSelectedVideo(firstAccessible);
          fetchVideoDetails(firstAccessible.id);
        }
      } else {
        setError(data.error || "Курс не найден");
      }
    } catch (err) {
      setError("Ошибка загрузки курса");
      console.error("Ошибка загрузки курса:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideoDetails = async (videoId: string) => {
    try {
      setLoadingVideoDetails(true);
      const response = await fetch(`/api/videos/${videoId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedVideoDetails(data.data);
      } else {
        console.error("Ошибка загрузки деталей видео:", data.error);
      }
    } catch (err) {
      console.error("Ошибка загрузки деталей видео:", err);
    } finally {
      setLoadingVideoDetails(false);
    }
  };

  const fetchRequestStatus = async () => {
    if (!isAuthenticated || !course) return;

    try {
      const response = await getRequestStatus(course.id);
      if (response.success && response.data) {
        const statusData = response.data;
        console.log('statusData: ', statusData);
        
        setRequestStatus(statusData.status);
        
        // Обновляем информацию о доступе к курсу
        if (statusData.hasAccess && course) {
          setCourse({
            ...course,
            hasAccess: statusData.hasAccess
          });
        }
      }
    } catch (err) {
      console.error("Ошибка получения статуса заявки:", err);
    }
  };

  const getVideoAccess = (video: Video): boolean => {
    if (!course) return false;

    const isAdmin = user?.role === "ADMIN";
    if (isAdmin) return true;

    if (course.isFree || course.hasAccess) return true;
    return video.isFree;
  };

  const selectVideo = (video: Video) => {
    if (getVideoAccess(video)) {
      setSelectedVideo(video);
      setSelectedVideoDetails(null);
      fetchVideoDetails(video.id);
    }
  };

  const handlePurchaseRequest = async () => {
    if (!course || !user?.email) return;

    try {
      const response = await createRequest(course.id, "email");
      if (response.success) {
        await fetchRequestStatus();
        return Promise.resolve();
      } else {
        return Promise.reject(
          new Error(response.error || "Ошибка отправки заявки")
        );
      }
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const handleCancelRequest = async () => {
    if (!course) return;

    try {
      const response = await cancelRequest(course.id);
      if (response.success) {
        await fetchRequestStatus();
        return Promise.resolve();
      } else {
        return Promise.reject(
          new Error(response.error || "Ошибка отмены заявки")
        );
      }
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const getThumbnailUrl = (thumbnail: string | null): string | null => {
    if (!thumbnail) return null;

    if (thumbnail.startsWith("/uploads/")) {
      return `/api${thumbnail}`;
    }

    return `/api/uploads/thumbnails/${thumbnail}`;
  };

  const getSortedVideos = (): Video[] => {
    if (!course?.videos) return [];
    return [...course.videos].sort((a, b) => a.orderIndex - b.orderIndex);
  };

  useEffect(() => {
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    if (course?.id && isAuthenticated) {
      fetchRequestStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id, isAuthenticated]);

  return {
    // Data
    course,
    selectedVideo,
    selectedVideoDetails,
    requestStatus,

    // Loading states
    loading,
    loadingVideoDetails,
    requestLoading,

    // Error states
    error,

    // Actions
    selectVideo,
    handlePurchaseRequest,
    handleCancelRequest,
    refetchCourse: fetchCourse,

    // Utils
    getVideoAccess,
    getThumbnailUrl,
    getSortedVideos,
  };
}
