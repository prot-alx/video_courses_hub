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

// Специализированные хуки
export function useCourseRequest() {
  const { request, loading } = useApi();

  const createRequest = async (
    courseId: string,
    contactMethod: "email" | "phone" | "telegram"
  ) => {
    return request("/api/course-request", {
      method: "POST",
      body: JSON.stringify({ courseId, contactMethod }),
    });
  };

  const cancelRequest = async (courseId: string) => {
    return request(`/api/course-request?courseId=${courseId}`, {
      method: "DELETE",
    });
  };

  const getRequestStatus = async (courseId: string) => {
    return request(`/api/course-request/status?courseId=${courseId}`);
  };

  return {
    createRequest,
    cancelRequest,
    getRequestStatus,
    loading,
  };
}
