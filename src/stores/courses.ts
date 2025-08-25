import { create } from "zustand";
import type { Course, Video, CourseFilterType } from "@/types";

interface CoursesStore {
  // State
  courses: Course[];
  currentCourse: Course | null;
  videos: Video[];
  isLoading: boolean;
  error: string | null;
  filter: CourseFilterType;

  // Actions
  setCourses: (courses: Course[]) => void;
  setCurrentCourse: (course: Course | null) => void;
  setVideos: (videos: Video[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: CourseFilterType) => void;

  // Course management
  addCourse: (course: Course) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  reorderCourses: (courseIds: string[]) => void;

  // Video management
  addVideo: (video: Video) => void;
  updateVideo: (videoId: string, updates: Partial<Video>) => void;
  deleteVideo: (videoId: string) => void;
  reorderVideos: (videoIds: string[]) => void;

  // Computed
  getFilteredCourses: () => Course[];
  getCourseById: (id: string) => Course | undefined;
  getVideoById: (id: string) => Video | undefined;

  // Async actions
  fetchCourses: () => Promise<void>;
  fetchCourse: (id: string) => Promise<void>;
  fetchVideos: (courseId: string) => Promise<void>;
}

export const useCoursesStore = create<CoursesStore>()((set, get) => ({
      // Initial state
      courses: [],
      currentCourse: null,
      videos: [],
      isLoading: false,
      error: null,
      filter: "all",

      // Basic setters
      setCourses: (courses) => set({ courses, error: null }),
      setCurrentCourse: (currentCourse) => set({ currentCourse }),
      setVideos: (videos) => set({ videos }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      setFilter: (filter) => set({ filter }),

      // Course management
      addCourse: (course) => {
        const courses = get().courses;
        set({ courses: [course, ...courses] });
      },

      updateCourse: (courseId, updates) => {
        const courses = get().courses;
        const updatedCourses = courses.map((course) =>
          course.id === courseId ? { ...course, ...updates } : course
        );
        set({ courses: updatedCourses });

        // Update current course if it's the one being updated
        const currentCourse = get().currentCourse;
        if (currentCourse?.id === courseId) {
          set({ currentCourse: { ...currentCourse, ...updates } });
        }
      },

      deleteCourse: (courseId) => {
        const courses = get().courses;
        const filteredCourses = courses.filter(
          (course) => course.id !== courseId
        );
        set({ courses: filteredCourses });

        // Clear current course if it's the one being deleted
        const currentCourse = get().currentCourse;
        if (currentCourse?.id === courseId) {
          set({ currentCourse: null });
        }
      },

      reorderCourses: (courseIds) => {
        const courses = get().courses;
        const reorderedCourses = courseIds
          .map((id) => courses.find((course) => course.id === id)!)
          .filter(Boolean);
        set({ courses: reorderedCourses });
      },

      // Video management
      addVideo: (video) => {
        const videos = get().videos;
        const newVideos = [...videos, video].sort(
          (a, b) => a.orderIndex - b.orderIndex
        );
        set({ videos: newVideos });

        // Update current course videos count if applicable
        const currentCourse = get().currentCourse;
        if (currentCourse && video.id) {
          const updatedCourse = {
            ...currentCourse,
            videosCount: (currentCourse.videosCount || 0) + 1,
            videos: newVideos,
          };
          set({ currentCourse: updatedCourse });
        }
      },

      updateVideo: (videoId, updates) => {
        const videos = get().videos;
        const updatedVideos = videos.map((video) =>
          video.id === videoId ? { ...video, ...updates } : video
        );
        set({ videos: updatedVideos });

        // Update current course videos if applicable
        const currentCourse = get().currentCourse;
        if (currentCourse && currentCourse.videos) {
          const updatedCourseVideos = currentCourse.videos.map((video) =>
            video.id === videoId ? { ...video, ...updates } : video
          );
          set({
            currentCourse: {
              ...currentCourse,
              videos: updatedCourseVideos,
            },
          });
        }
      },

      deleteVideo: (videoId) => {
        const videos = get().videos;
        const filteredVideos = videos.filter((video) => video.id !== videoId);
        set({ videos: filteredVideos });

        // Update current course
        const currentCourse = get().currentCourse;
        if (currentCourse && currentCourse.videos) {
          const filteredCourseVideos = currentCourse.videos.filter(
            (video) => video.id !== videoId
          );
          set({
            currentCourse: {
              ...currentCourse,
              videosCount: Math.max(0, (currentCourse.videosCount || 0) - 1),
              videos: filteredCourseVideos,
            },
          });
        }
      },

      reorderVideos: (videoIds) => {
        const videos = get().videos;
        const reorderedVideos = videoIds
          .map((id) => videos.find((video) => video.id === id)!)
          .filter(Boolean);
        set({ videos: reorderedVideos });

        // Update current course videos order
        const currentCourse = get().currentCourse;
        if (currentCourse) {
          set({
            currentCourse: {
              ...currentCourse,
              videos: reorderedVideos,
            },
          });
        }
      },

      // Computed getters
      getFilteredCourses: () => {
        const { courses, filter } = get();

        switch (filter) {
          case "free":
            return courses.filter((course) => course.isFree);
          case "paid":
            return courses.filter((course) => !course.isFree);
          case "featured":
            return courses.filter(
              (course) => !course.isFree && course.price && course.price > 0
            );
          default:
            return courses;
        }
      },

      getCourseById: (id) => {
        return get().courses.find((course) => course.id === id);
      },

      getVideoById: (id) => {
        return get().videos.find((video) => video.id === id);
      },

      // Async actions
      fetchCourses: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/courses?type=all`);
          const result = await response.json();

          if (result.success) {
            set({
              courses: result.data,
              isLoading: false,
            });
          } else {
            set({
              error: result.error || "Ошибка загрузки курсов",
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("Ошибка загрузки курсов:", error);
          set({
            error: "Ошибка сети",
            isLoading: false,
          });
        }
      },

      fetchCourse: async (id) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/courses/${id}`);
          const result = await response.json();

          if (result.success) {
            set({
              currentCourse: result.data,
              videos: result.data.videos || [],
              isLoading: false,
            });
          } else {
            set({
              error: result.error || "Ошибка загрузки курса",
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("Ошибка загрузки курса:", error);
          set({
            error: "Ошибка сети",
            isLoading: false,
          });
        }
      },

      fetchVideos: async (courseId) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(
            `/api/admin/videos?courseId=${courseId}`
          );
          const result = await response.json();

          if (result.success) {
            set({
              videos: result.data,
              isLoading: false,
            });
          } else {
            set({
              error: result.error || "Ошибка загрузки видео",
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("Ошибка загрузки видео:", error);
          set({
            error: "Ошибка сети",
            isLoading: false,
          });
        }
      },
  }));
