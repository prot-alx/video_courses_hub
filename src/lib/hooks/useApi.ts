import { useState } from "react";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function useApi() {
  const [loading, setLoading] = useState(false);

  const request = async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    setLoading(true);
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API Error:", error);
      return {
        success: false,
        error: "Ошибка сети",
      };
    } finally {
      setLoading(false);
    }
  };

  return { request, loading };
}

// Типы для курсовых заявок
interface RequestStatusData {
  hasAccess: boolean;
  status: string;
  canRequest?: boolean;
  canCancel?: boolean;
  requestId?: string;
  createdAt?: string;
  processedAt?: string;
  grantedAt?: string;
  lastCancelled?: string;
}

interface CreateRequestData {
  id: string;
  status: string;
  createdAt: string;
  course: {
    title: string;
  };
  message: string;
}

// Специализированные хуки
export function useCourseRequest() {
  const { request, loading } = useApi();

  const createRequest = async (
    courseId: string,
    contactMethod: "email" | "phone" | "telegram"
  ): Promise<ApiResponse<CreateRequestData>> => {
    return request<CreateRequestData>("/api/course-request", {
      method: "POST",
      body: JSON.stringify({ courseId, contactMethod }),
    });
  };

  const cancelRequest = async (
    courseId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    return request<{ message: string }>(
      `/api/course-request?courseId=${courseId}`,
      {
        method: "DELETE",
      }
    );
  };

  const getRequestStatus = async (
    courseId: string
  ): Promise<ApiResponse<RequestStatusData>> => {
    return request<RequestStatusData>(
      `/api/course-request/status?courseId=${courseId}`
    );
  };

  return {
    createRequest,
    cancelRequest,
    getRequestStatus,
    loading,
  };
}
