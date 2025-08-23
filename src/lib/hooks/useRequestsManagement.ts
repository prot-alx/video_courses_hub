import { useState, useEffect } from "react";
import { useToastContext } from "@/components/providers/ToastProvider";
import type {
  CourseRequest,
  RequestStatus,
  ApiResponse,
  RequestsApiResponse,
  RequestStats,
  FilterType,
} from "@/types";

interface UseRequestsManagementProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface UseRequestsManagementReturn {
  // Data state
  requests: CourseRequest[];
  stats: RequestStats;
  filter: FilterType;
  filteredRequests: CourseRequest[];

  // Loading states
  isLoading: boolean;
  processingId: string | null;
  error: string | null;

  // Actions
  setFilter: (filter: FilterType) => void;
  handleApprove: (requestId: string) => Promise<void>;
  handleReject: (requestId: string) => Promise<void>;
  fetchRequests: (statusFilter?: string) => Promise<void>;
  getEmptyMessage: () => string;
}

export function useRequestsManagement({
  isAuthenticated,
  isAdmin,
}: UseRequestsManagementProps): UseRequestsManagementReturn {
  const toast = useToastContext();

  const [filter, setFilter] = useState<FilterType>("all");
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [stats, setStats] = useState<RequestStats>({
    all: 0,
    new: 0,
    approved: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async (statusFilter?: string) => {
    try {
      setIsLoading(true);
      const url =
        statusFilter && statusFilter !== "all"
          ? `/api/admin/requests?status=${statusFilter}`
          : "/api/admin/requests";

      const response = await fetch(url);
      const data: ApiResponse<RequestsApiResponse> = await response.json();

      if (data.success && data.data) {
        const requestsData = data.data;

        // Трансформируем данные, убеждаясь, что они соответствуют нашим типам
        const transformedRequests: CourseRequest[] = requestsData.requests.map(
          (apiRequest) => ({
            id: apiRequest.id,
            userId: apiRequest.userId,
            courseId: apiRequest.courseId,
            user: {
              name: apiRequest.user.name || "Без имени",
              displayName: apiRequest.user.displayName,
              email: apiRequest.user.email,
              phone: apiRequest.user.phone,
              telegram: apiRequest.user.telegram,
              preferredContact: apiRequest.user.preferredContact,
            },
            course: {
              id: apiRequest.course.id,
              title: apiRequest.course.title,
              price: apiRequest.course.price || 0,
            },
            status: apiRequest.status,
            contactMethod: apiRequest.contactMethod,
            createdAt: apiRequest.createdAt,
            processedAt: apiRequest.processedAt,
          })
        );

        setRequests(transformedRequests);
        setStats({
          all: requestsData.stats.total,
          new: requestsData.stats.new,
          approved: requestsData.stats.approved,
          rejected: requestsData.stats.rejected,
        });
        setError(null);
      } else {
        setError(data.error || "Ошибка загрузки заявок");
      }
    } catch (err) {
      setError("Ошибка сети при загрузке заявок");
      console.error("Ошибка загрузки заявок:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchRequests();
    }
  }, [isAuthenticated, isAdmin]);

  const handleApprove = async (requestId: string) => {
    if (processingId) return;

    setProcessingId(requestId);
    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "approved" satisfies RequestStatus,
        }),
      });

      const data: ApiResponse<unknown> = await response.json();

      if (data.success) {
        toast.success("Заявка одобрена!", "Пользователю выдан доступ к курсу");
        await fetchRequests(filter); // Обновляем список
      } else {
        toast.error(
          "Ошибка одобрения",
          data.error || "Ошибка при одобрении заявки"
        );
      }
    } catch (error) {
      toast.error("Сетевая ошибка", "Ошибка сети при одобрении заявки");
      console.error("Ошибка одобрения заявки:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (processingId) return;

    setProcessingId(requestId);
    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rejected" satisfies RequestStatus,
        }),
      });

      const data: ApiResponse<unknown> = await response.json();

      if (data.success) {
        toast.success("Заявка отклонена");
        await fetchRequests(filter); // Обновляем список
      } else {
        toast.error(
          "Ошибка отклонения",
          data.error || "Ошибка при отклонении заявки"
        );
      }
    } catch (error) {
      toast.error("Сетевая ошибка", "Ошибка сети при отклонении заявки");
      console.error("Ошибка отклонения заявки:", error);
    } finally {
      setProcessingId(null);
    }
  };

  // Фильтрация заявок на клиенте (дополнительно к серверной фильтрации)
  const filteredRequests = requests.filter(
    (req) => filter === "all" || req.status === filter
  );

  const getEmptyMessage = () => {
    if (filter === "all") return "Заявок пока нет";
    const filterLabels = {
      new: "новых",
      approved: "одобренных",
      rejected: "отклоненных",
    } as const;
    return `Нет ${filterLabels[filter]} заявок`;
  };

  return {
    // Data state
    requests,
    stats,
    filter,
    filteredRequests,

    // Loading states
    isLoading,
    processingId,
    error,

    // Actions
    setFilter,
    handleApprove,
    handleReject,
    fetchRequests,
    getEmptyMessage,
  };
}
