import { FormState, ContactMethod } from "./common";
import {
  CreateCourseInput,
  UpdateCourseInput,
  CreateVideoInput,
  UpdateVideoInput,
} from "./course";
import { UpdateUserProfileInput } from "./user";

// === FORM VALIDATION TYPES ===
export interface ValidationRule<T = unknown> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: T) => string | null;
}

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

export interface FieldError {
  message: string;
  code: string;
}

export type FormErrors<T> = {
  [K in keyof T]?: FieldError;
};

// === FORM FIELD TYPES ===
export interface FormField<T = unknown> {
  value: T;
  error?: FieldError;
  touched: boolean;
  dirty: boolean;
  disabled: boolean;
  loading: boolean;
}

export type FormFields<T> = {
  [K in keyof T]: FormField<T[K]>;
};

// === ENHANCED FORM STATE ===
export interface EnhancedFormState<T> extends FormState<T> {
  fields: FormFields<T>;
  touched: boolean;
  pristine: boolean;
  validationRules?: ValidationRules<T>;
  submitCount: number;
  lastSubmitTime?: Date;
}

// === FORM HOOKS INTERFACES ===
export interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  enableReinitialize?: boolean;
  onSubmit: (values: T) => Promise<void> | void;
  onValidationError?: (errors: FormErrors<T>) => void;
}

export interface UseFormReturn<T> {
  values: T;
  errors: FormErrors<T>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitCount: number;

  // Actions
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldError: <K extends keyof T>(
    field: K,
    error: FieldError | null
  ) => void;
  setFieldTouched: <K extends keyof T>(field: K, touched: boolean) => void;
  validateField: <K extends keyof T>(field: K) => Promise<FieldError | null>;
  validateForm: () => Promise<FormErrors<T>>;
  resetForm: (newValues?: Partial<T>) => void;
  submitForm: () => Promise<void>;

  // Field helpers
  getFieldProps: <K extends keyof T>(field: K) => FieldProps<T[K]>;
  getFieldMeta: <K extends keyof T>(field: K) => FieldMeta;
}

export interface FieldProps<T> {
  name: string;
  value: T;
  onChange: (value: T) => void;
  onBlur: () => void;
  disabled: boolean;
}

export interface FieldMeta {
  touched: boolean;
  error?: FieldError;
  dirty: boolean;
}

// === SPECIFIC FORM TYPES ===

// Course Creation Form
export interface CourseFormData extends CreateCourseInput {
  thumbnailFile?: File;
}

export interface CourseFormState extends EnhancedFormState<CourseFormData> {
  thumbnailPreview?: string;
  uploadingThumbnail: boolean;
}

// Course Edit Form
export interface CourseEditFormData extends UpdateCourseInput {
  id: string;
  thumbnailFile?: File;
}

// Video Upload Form
export interface VideoUploadFormData extends CreateVideoInput {
  videoFile?: File;
  posterFile?: File;
}

export interface VideoUploadFormState
  extends EnhancedFormState<VideoUploadFormData> {
  uploadProgress: number;
  uploadingVideo: boolean;
  uploadingPoster: boolean;
  videoPreview?: string;
  posterPreview?: string;
}

// Video Edit Form
export interface VideoEditFormData extends UpdateVideoInput {
  id: string;
  posterFile?: File;
}

// User Profile Form
export interface ProfileFormData extends UpdateUserProfileInput {
  // Additional UI-only fields
  emailNotifications?: boolean;
  marketingEmails?: boolean;
}

export interface ProfileFormState extends EnhancedFormState<ProfileFormData> {
  savingProfile: boolean;
  lastSavedAt?: Date;
}

// Course Request Form
export interface CourseRequestFormData {
  courseId: string;
  contactMethod: ContactMethod;
  message?: string;
  agreedToTerms: boolean;
}

// Admin Settings Form
export interface AdminSettingsFormData {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  supportPhone?: string;
  supportTelegram?: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maxFileUploadSize: number; // in MB
  allowedVideoFormats: string[];
  allowedImageFormats: string[];
}

// Search/Filter Forms
export interface CourseSearchFormData {
  query: string;
  type: "all" | "free" | "paid" | "featured";
  priceRange: {
    min?: number;
    max?: number;
  };
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  tags: string[];
  sortBy: "title" | "price" | "created" | "popularity";
  sortOrder: "asc" | "desc";
}

export interface UserSearchFormData {
  query: string;
  role?: "USER" | "ADMIN";
  hasActiveRequests?: boolean;
  registeredAfter?: Date;
  sortBy: "name" | "email" | "created" | "lastLogin";
  sortOrder: "asc" | "desc";
}

// === FORM FIELD COMPONENT PROPS ===
export interface BaseFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface TextFieldProps extends BaseFieldProps {
  type?: "text" | "email" | "password" | "url" | "tel";
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
}

export interface NumberFieldProps extends BaseFieldProps {
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}

export interface SelectFieldProps extends BaseFieldProps {
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  multiple?: boolean;
  searchable?: boolean;
}

export interface FileFieldProps extends BaseFieldProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  preview?: boolean;
  dragAndDrop?: boolean;
}

export interface CheckboxFieldProps extends BaseFieldProps {
  indeterminate?: boolean;
}

export interface RadioFieldProps extends BaseFieldProps {
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  inline?: boolean;
}

// === FORM VALIDATION HELPERS ===
export const VALIDATION_MESSAGES = {
  REQUIRED: "Это поле обязательно для заполнения",
  EMAIL: "Введите корректный email адрес",
  MIN_LENGTH: (min: number) => `Минимум ${min} символов`,
  MAX_LENGTH: (max: number) => `Максимум ${max} символов`,
  MIN_VALUE: (min: number) => `Минимальное значение: ${min}`,
  MAX_VALUE: (max: number) => `Максимальное значение: ${max}`,
  PATTERN: "Некорректный формат",
  FILE_SIZE: (maxSize: number) =>
    `Размер файла не должен превышать ${maxSize}MB`,
  FILE_TYPE: "Неподдерживаемый тип файла",
} as const;

// === FORM CONTEXT TYPES ===
export interface FormContextValue<T> {
  formState: EnhancedFormState<T>;
  formActions: UseFormReturn<T>;
}

// === FORM STEP TYPES (для многошаговых форм) ===
export interface FormStep<T = unknown> {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<FormStepProps<T>>;
  validationRules?: ValidationRules<Partial<T>>;
  optional?: boolean;
}

export interface FormStepProps<T> {
  data: Partial<T>;
  errors: FormErrors<T>;
  isActive: boolean;
  isCompleted: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onDataChange: (data: Partial<T>) => void;
}

export interface MultiStepFormState<T> {
  currentStep: number;
  steps: FormStep<T>[];
  data: Partial<T>;
  errors: FormErrors<T>;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isCompleted: boolean;
}
