// lib/hooks/useApi.ts (обновленная версия с централизованными типами)
import { useState } from "react";
import {
  ApiResponse,
  ContactMethod,
  CreateRequestData,
  RequestStatus,
} from "@/types";

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
    contactMethod: ContactMethod
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
  ): Promise<ApiResponse<RequestStatus>> => {
    return request<RequestStatus>(
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
