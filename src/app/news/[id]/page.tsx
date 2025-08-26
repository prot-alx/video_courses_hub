"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import OptimizedImage from "@/components/ui/OptimizedImage";
import type { ApiResponse } from "@/types";

interface News {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  image: string | null;
  createdAt: string;
}

export default function NewsDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = use(params);
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/news/${id}`);
      const data: ApiResponse<News> = await response.json();

      if (data.success && data.data) {
        setNews(data.data);
      } else {
        notFound();
      }
    } catch (error) {
      console.error("Ошибка загрузки новости:", error);
      notFound();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getImageUrl = (image: string | null) => {
    if (!image) return "/placeholder-news.jpg";
    return `/api/uploads/thumbnails/${image}`;
  };

  const formatText = (text: string) => {
    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span
              className="ml-3"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Загрузка новости...
            </span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!news) {
    notFound();
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-6 py-8">
        {/* Навигационные крошки */}
        <nav
          className="flex items-center space-x-2 text-sm mb-8"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <Link
            href="/"
            className="hover:opacity-80 transition-opacity"
            style={{ color: "var(--color-primary-500)" }}
          >
            Главная
          </Link>
          <span>→</span>
          <Link
            href="/news"
            className="hover:opacity-80 transition-opacity"
            style={{ color: "var(--color-primary-500)" }}
          >
            Новости
          </Link>
          <span>→</span>
          <span
            className="truncate max-w-xs"
            style={{ color: "var(--color-text-primary)" }}
          >
            {news.title}
          </span>
        </nav>

        <div className="max-w-4xl mx-auto">
          {/* Заголовок и мета-информация */}
          <div className="mb-8">
            <h1
              className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              {news.title}
            </h1>

            <div
              className="flex items-center mb-6"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <time dateTime={news.createdAt} className="text-sm">
                {formatDate(news.createdAt)}
              </time>
            </div>

            <p
              className="text-xl leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {news.shortDescription}
            </p>
          </div>

          {/* Изображение */}
          {news.image && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
              <div className="aspect-video relative bg-gray-100">
                <OptimizedImage
                  src={getImageUrl(news.image)}
                  alt={news.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1024px"
                  priority
                />
              </div>
            </div>
          )}

          {/* Основной контент */}
          <article className="prose prose-lg max-w-none">
            <div
              className="leading-relaxed whitespace-pre-wrap"
              style={{ color: "var(--color-text-primary)" }}
            >
              {formatText(news.fullDescription)}
            </div>
          </article>

          {/* Навигация назад */}
          <div
            className="mt-12 pt-8 border-t"
            style={{ borderColor: "var(--color-primary-400)" }}
          >
            <Link
              href="/news"
              className="btn-discord btn-discord-primary inline-flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Вернуться к новостям
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
