import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ApiResponse, RequestStatus } from "@/types";

export interface CourseRequest {
  id: string;
  userId: string;
  courseId: string;
  status: RequestStatus;
  createdAt: string;
  processedAt?: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone?: string | null;
    telegram?: string | null;
  };
  course: {
    id: string;
    title: string;
    price: number | null;
  };
}

interface CourseRequestsStore {
  // State
  requests: CourseRequest[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setRequests: (requests: CourseRequest[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Request management
  addRequest: (request: CourseRequest) => void;
  updateRequestStatus: (
    requestId: string,
    status: CourseRequest["status"]
  ) => void;
  removeRequest: (requestId: string) => void;

  // Computed
  getPendingRequests: () => CourseRequest[];
  getRequestsByStatus: (status: CourseRequest["status"]) => CourseRequest[];
  getRequestsCount: () => number;
  getPendingCount: () => number;

  // Async actions
  fetchRequests: () => Promise<void>;
  createRequest: (courseId: string) => Promise<boolean>;
  approveRequest: (requestId: string) => Promise<boolean>;
  rejectRequest: (requestId: string) => Promise<boolean>;
}

export const useCourseRequestsStore = create<CourseRequestsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      requests: [],
      isLoading: false,
      error: null,

      // Basic setters
      setRequests: (requests) => set({ requests, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),

      // Request management
      addRequest: (request) => {
        const requests = get().requests;
        set({ requests: [request, ...requests] });
      },

      updateRequestStatus: (requestId, status) => {
        const requests = get().requests;
        const updatedRequests = requests.map((request) =>
          request.id === requestId
            ? { ...request, status, processedAt: new Date().toISOString() }
            : request
        );
        set({ requests: updatedRequests });
      },

      removeRequest: (requestId) => {
        const requests = get().requests;
        const filteredRequests = requests.filter(
          (request) => request.id !== requestId
        );
        set({ requests: filteredRequests });
      },

      // Computed getters
      getPendingRequests: () => {
        return get().requests.filter((request) => request.status === "new");
      },

      getRequestsByStatus: (status) => {
        return get().requests.filter((request) => request.status === status);
      },

      getRequestsCount: () => {
        return get().requests.length;
      },

      getPendingCount: () => {
        return get().requests.filter((request) => request.status === "new")
          .length;
      },

      // Async actions
      fetchRequests: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/admin/requests");
          const result: ApiResponse<CourseRequest[]> = await response.json();

          if (result.success && result.data) {
            set({
              requests: result.data,
              isLoading: false,
            });
          } else {
            set({
              error: result.error || "Ошибка загрузки заявок",
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("Ошибка загрузки заявок:", error);
          set({
            error: "Ошибка сети",
            isLoading: false,
          });
        }
      },

      createRequest: async (courseId) => {
        try {
          const response = await fetch("/api/course-request", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ courseId }),
          });

          const result: ApiResponse<CourseRequest> = await response.json();

          if (result.success && result.data) {
            get().addRequest(result.data);
            return true;
          } else {
            set({ error: result.error || "Ошибка создания заявки" });
            return false;
          }
        } catch (error) {
          console.error("Ошибка создания заявки:", error);
          set({ error: "Ошибка сети" });
          return false;
        }
      },

      approveRequest: async (requestId) => {
        try {
          const response = await fetch(`/api/admin/requests/${requestId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "approved" }),
          });

          const result: ApiResponse<{ success: boolean }> =
            await response.json();

          if (result.success) {
            get().updateRequestStatus(requestId, "approved");
            return true;
          } else {
            set({ error: result.error || "Ошибка одобрения заявки" });
            return false;
          }
        } catch (error) {
          console.error("Ошибка одобрения заявки:", error);
          set({ error: "Ошибка сети" });
          return false;
        }
      },

      rejectRequest: async (requestId) => {
        try {
          const response = await fetch(`/api/admin/requests/${requestId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "rejected" }),
          });

          const result: ApiResponse<{ success: boolean }> =
            await response.json();

          if (result.success) {
            get().updateRequestStatus(requestId, "rejected");
            return true;
          } else {
            set({ error: result.error || "Ошибка отклонения заявки" });
            return false;
          }
        } catch (error) {
          console.error("Ошибка отклонения заявки:", error);
          set({ error: "Ошибка сети" });
          return false;
        }
      },
    }),
    {
      name: "course-requests-storage",
      partialize: (state) => ({
        requests: state.requests,
      }),
    }
  )
);
