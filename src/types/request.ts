// types/request.ts - Типы для заявок
import { RequestStatus, ContactMethod, PreferredContact } from "./common";

export interface RequestUser {
  name: string;
  email: string;
  phone?: string | null;
  telegram?: string | null;
  preferredContact: PreferredContact;
}

export interface RequestCourse {
  id: string;
  title: string;
  price: number;
}

export interface CourseRequest {
  id: string;
  user: RequestUser;
  course: RequestCourse;
  status: RequestStatus;
  contactMethod: ContactMethod;
  createdAt: string;
  processedAt?: string;
}

export interface UserRequestStatus {
  hasAccess: boolean;
  status: RequestStatus;
  canRequest?: boolean;
  canCancel?: boolean;
  requestId?: string;
  createdAt?: string;
  processedAt?: string;
  grantedAt?: string;
  lastCancelled?: string;
}

export interface CreateRequestData {
  id: string;
  status: string;
  createdAt: string;
  course: {
    title: string;
  };
  message: string;
}
