import { create } from "zustand";

export interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  user: {
    name: string | null;
    displayName?: string | null;
    email: string;
  };
}

export interface ReviewsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  approvedTotal: number;
}

export interface UserReview {
  id: string;
  rating: number;
  comment: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

interface ReviewsStore {
  // State
  reviews: Review[];
  userReviews: UserReview[];
  pagination: ReviewsPagination | null;
  averageRating: number;
  isLoading: boolean;
  error: string | null;
  // Запоминаем последние параметры для обновления
  lastFetchParams: { page: number; limit: number; userId?: string } | null;

  // Actions
  setReviews: (reviews: Review[]) => void;
  setUserReviews: (reviews: UserReview[]) => void;
  setPagination: (pagination: ReviewsPagination | null) => void;
  setAverageRating: (rating: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API Actions
  fetchReviews: (page?: number, limit?: number, userId?: string) => Promise<void>;
  loadMoreReviews: () => Promise<void>;
  fetchUserReviews: () => Promise<void>;
  submitReview: (rating: number, comment: string) => Promise<string>;
  deleteReview: (reviewId: string) => Promise<string>;

  // Utility
  clearError: () => void;
  reset: () => void;

  // Computed
  hasPendingReviews: () => boolean;
}

export const useReviewsStore = create<ReviewsStore>((set, get) => ({
  // Initial state
  reviews: [],
  userReviews: [],
  pagination: null,
  averageRating: 0,
  isLoading: false,
  error: null,
  lastFetchParams: null,

  // Basic setters
  setReviews: (reviews) => set({ reviews }),
  setUserReviews: (userReviews) => set({ userReviews }),
  setPagination: (pagination) => set({ pagination }),
  setAverageRating: (averageRating) => set({ averageRating }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // API Actions
  fetchReviews: async (page = 1, limit = 10, userId?: string) => {
    set({ isLoading: true, error: null });
    
    // Запоминаем параметры для последующих обновлений
    set({ lastFetchParams: { page, limit, userId } });
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (userId) {
        params.set('userId', userId);
      }

      const response = await fetch(`/api/reviews?${params}`);
      const data = await response.json();

      if (data.success) {
        if (page === 1) {
          set({ 
            reviews: data.data, 
            pagination: data.pagination,
            averageRating: data.averageRating,
            isLoading: false 
          });
        } else {
          // Append for load more
          set({ 
            reviews: [...get().reviews, ...data.data],
            pagination: data.pagination,
            averageRating: data.averageRating,
            isLoading: false 
          });
        }
      } else {
        set({
          error: data.error || "Ошибка загрузки отзывов",
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Ошибка загрузки отзывов:", error);
      set({ error: "Ошибка загрузки отзывов", isLoading: false });
    }
  },

  loadMoreReviews: async () => {
    const { pagination } = get();
    if (!pagination?.hasNext) return;
    
    await get().fetchReviews(pagination.page + 1, pagination.limit);
  },

  fetchUserReviews: async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();

      if (data.success && data.data.reviews) {
        set({ userReviews: data.data.reviews });
      } else {
        set({ userReviews: [] });
      }
    } catch (error) {
      console.error("Ошибка загрузки отзывов пользователя:", error);
      // Не показываем ошибку пользователю, просто устанавливаем пустой массив
      set({ userReviews: [] });
    }
  },

  submitReview: async (rating: number, comment: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        set({ isLoading: false });
        // Обновляем отзывы пользователя и общий список
        // Используем сохраненные параметры для обновления
        const params = get().lastFetchParams;
        await Promise.all([
          get().fetchUserReviews(), 
          params ? get().fetchReviews(params.page, params.limit, params.userId) : get().fetchReviews()
        ]);
        return data.message;
      } else {
        set({
          error: data.error || "Ошибка отправки отзыва",
          isLoading: false,
        });
        throw data.error;
      }
    } catch (error) {
      console.error("Ошибка отправки отзыва:", error);
      const errorMessage = "Ошибка отправки отзыва";
      set({ error: errorMessage, isLoading: false });
      throw errorMessage;
    }
  },

  deleteReview: async (reviewId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        set({ isLoading: false });
        // Обновляем отзывы пользователя и общий список
        // Используем сохраненные параметры для обновления
        const params = get().lastFetchParams;
        await Promise.all([
          get().fetchUserReviews(), 
          params ? get().fetchReviews(params.page, params.limit, params.userId) : get().fetchReviews()
        ]);
        return data.message;
      } else {
        set({
          error: data.error || "Ошибка удаления отзыва",
          isLoading: false,
        });
        throw data.error;
      }
    } catch (error) {
      console.error("Ошибка удаления отзыва:", error);
      const errorMessage = "Ошибка удаления отзыва";
      set({ error: errorMessage, isLoading: false });
      throw errorMessage;
    }
  },

  // Utility methods
  clearError: () => set({ error: null }),

  reset: () =>
    set({
      reviews: [],
      userReviews: [],
      pagination: null,
      averageRating: 0,
      isLoading: false,
      error: null,
      lastFetchParams: null,
    }),

  // Computed
  hasPendingReviews: () => {
    const userReviews = get().userReviews;
    return userReviews.some((review) => review.status === "pending");
  },
}));
