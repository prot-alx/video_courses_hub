"use client";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  initialData?: {
    rating: number;
    comment: string;
  };
  isLoading?: boolean;
}

export default function ReviewForm({
  onSubmit,
  initialData,
  isLoading = false,
}: Readonly<ReviewFormProps>) {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [comment, setComment] = useState(initialData?.comment || "");
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    await onSubmit(rating, comment);
  };

  if (!isAuthenticated) {
    return (
      <div
        className="p-6 rounded-lg border text-center"
        style={{
          background: "var(--color-primary-100)",
          borderColor: "var(--color-primary-400)",
        }}
      >
        <p style={{ color: "var(--color-text-secondary)" }}>
          Войдите в систему, чтобы оставить отзыв
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Оценка *
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="text-3xl transition-all hover:scale-110"
              style={{
                color:
                  star <= (hoveredRating || rating) ? "#fbbf24" : "#6b7280",
              }}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              {star <= (hoveredRating || rating) ? "★" : "☆"}
            </button>
          ))}
        </div>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {rating === 0 && "Выберите оценку"}
          {rating === 1 && "Ужасно"}
          {rating === 2 && "Плохо"}
          {rating === 3 && "Нормально"}
          {rating === 4 && "Хорошо"}
          {rating === 5 && "Отлично"}
        </p>
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Комментарий
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full p-3 rounded border resize-none"
          style={{
            background: "var(--color-primary-300)",
            borderColor: "var(--color-primary-400)",
            color: "var(--color-text-primary)",
          }}
          placeholder="Расскажите о своем опыте обучения..."
          maxLength={500}
        />
        <p
          className="text-sm mt-1 text-right"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {comment.length}/500
        </p>
      </div>

      <button
        type="submit"
        disabled={rating === 0 || isLoading}
        className="btn-discord btn-discord-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Отправка..." : "Отправить отзыв"}
      </button>
    </form>
  );
}