import { create } from "zustand";
import { cachedFetch, apiCache } from "@/lib/cache";

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
    email: string;
  };
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
  isLoading: boolean;
  error: string | null;

  // Actions
  setReviews: (reviews: Review[]) => void;
  setUserReviews: (reviews: UserReview[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API Actions
  fetchReviews: () => Promise<void>;
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
  isLoading: false,
  error: null,

  // Basic setters
  setReviews: (reviews) => set({ reviews }),
  setUserReviews: (userReviews) => set({ userReviews }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // API Actions
  fetchReviews: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await cachedFetch<{
        success: boolean;
        data: Review[];
        error?: string;
      }>("/api/reviews", undefined, "reviews", 3 * 60 * 1000); // кэш на 3 минуты

      if (data.success) {
        set({ reviews: data.data, isLoading: false });
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
        // Инвалидируем кэш
        apiCache.delete("reviews");
        // Обновляем отзывы пользователя и общий список
        await Promise.all([get().fetchUserReviews(), get().fetchReviews()]);
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
        // Инвалидируем кэш
        apiCache.delete("reviews");
        // Обновляем отзывы пользователя и общий список
        await Promise.all([get().fetchUserReviews(), get().fetchReviews()]);
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
      isLoading: false,
      error: null,
    }),

  // Computed
  hasPendingReviews: () => {
    const userReviews = get().userReviews;
    return userReviews.some((review) => review.status === "pending");
  },
}));
