import {
  CreateCourseSchema,
  ReviewSchema,
  ContactFormSchema,
  CourseRequestSchema,
} from "@/lib/validations";

describe("Validations", () => {
  describe("CreateCourseSchema", () => {
    it("should validate correct course data", () => {
      const validCourse = {
        title: "Тест курс",
        shortDescription: "Короткое описание",
        fullDescription: "Полное описание курса",
        price: 1000,
        isFree: false,
        isActive: true,
      };

      const result = CreateCourseSchema.safeParse(validCourse);
      expect(result.success).toBe(true);
    });

    it("should fail validation for empty title", () => {
      const invalidCourse = {
        title: "",
        price: 1000,
      };

      const result = CreateCourseSchema.safeParse(invalidCourse);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Название обязательно");
      }
    });

    it("should fail validation for negative price", () => {
      const invalidCourse = {
        title: "Тест курс",
        price: -100,
      };

      const result = CreateCourseSchema.safeParse(invalidCourse);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Цена должна быть больше 0"
        );
      }
    });

    it("should fail validation for too long title", () => {
      const invalidCourse = {
        title: "a".repeat(101), // 101 символ
        price: 1000,
      };

      const result = CreateCourseSchema.safeParse(invalidCourse);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Максимум 100 символов");
      }
    });
  });

  describe("ReviewSchema", () => {
    it("should validate correct review data", () => {
      const validReview = {
        rating: 5,
        comment: "Отличный курс!",
      };

      const result = ReviewSchema.safeParse(validReview);
      expect(result.success).toBe(true);
    });

    it("should fail validation for rating below 1", () => {
      const invalidReview = {
        rating: 0,
        comment: "Плохо",
      };

      const result = ReviewSchema.safeParse(invalidReview);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Оценка обязательна");
      }
    });

    it("should fail validation for rating above 5", () => {
      const invalidReview = {
        rating: 6,
        comment: "Супер!",
      };

      const result = ReviewSchema.safeParse(invalidReview);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Максимальная оценка 5");
      }
    });
  });

  describe("ContactFormSchema", () => {
    it("should validate correct contact form data", () => {
      const validForm = {
        name: "Иван Петров",
        email: "ivan@example.com",
        subject: "general",
        message: "Здравствуйте, у меня есть вопрос",
      };

      const result = ContactFormSchema.safeParse(validForm);
      expect(result.success).toBe(true);
    });

    it("should fail validation for invalid email", () => {
      const invalidForm = {
        name: "Иван Петров",
        email: "invalid-email",
        message: "Тест",
      };

      const result = ContactFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Некорректный email");
      }
    });

    it("should fail validation for empty name", () => {
      const invalidForm = {
        name: "",
        email: "test@example.com",
        message: "Тест",
      };

      const result = ContactFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Имя обязательно");
      }
    });
  });

  describe("CourseRequestSchema", () => {
    it("should validate correct course request data", () => {
      const validRequest = {
        courseId: "course-123",
        contactMethod: "email",
      };

      const result = CourseRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it("should fail validation for invalid contact method", () => {
      const invalidRequest = {
        courseId: "course-123",
        contactMethod: "invalid-method",
      };

      const result = CourseRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });
});
