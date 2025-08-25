"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import OptimizedImage from "@/components/ui/OptimizedImage";
import type { ApiResponse } from "@/types";

interface News {
  id: string;
  title: string;
  shortDescription: string;
  image: string | null;
  createdAt: string;
}

interface NewsResponse {
  news: News[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
  };
}

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchNews = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/news?page=${page}&limit=12`);
      const data: ApiResponse<NewsResponse> = await response.json();

      if (data.success && data.data) {
        setNews(data.data.news);
        setCurrentPage(data.data.pagination.currentPage);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Ошибка загрузки новостей:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(currentPage);
  }, [currentPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getImageUrl = (image: string | null) => {
    if (!image) return "/placeholder-news.jpg"; // Заглушка
    return `/api/uploads/thumbnails/${image}`;
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
              Загрузка новостей...
            </span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            Новости
          </h1>
          <p
            className="text-xl mb-8 max-w-2xl mx-auto"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Следите за последними обновлениями и событиями нашей платформы
          </p>
        </div>

        {news.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📰</div>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              Новостей пока нет
            </h2>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Скоро здесь появятся интересные новости и обновления
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow duration-200"
                  style={{
                    background: "var(--color-primary-100)",
                    borderColor: "var(--color-primary-400)",
                  }}
                >
                  <Link href={`/news/${item.id}`}>
                    <div className="aspect-video relative bg-gray-100">
                      <OptimizedImage
                        src={getImageUrl(item.image)}
                        alt={item.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-200"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                  </Link>

                  <div className="p-6">
                    <div
                      className="flex items-center text-sm mb-3"
                      style={{ color: "var(--color-primary-400)" }}
                    >
                      <time dateTime={item.createdAt}>
                        {formatDate(item.createdAt)}
                      </time>
                    </div>

                    <Link href={`/news/${item.id}`}>
                      <h2
                        className="text-xl font-semibold mb-3 line-clamp-2 transition-colors"
                        style={{
                          color: "var(--color-primary-400)",
                        }}
                      >
                        {item.title}
                      </h2>
                    </Link>

                    <p
                      className="text-sm line-clamp-3 mb-4"
                      style={{ color: "var(--color-primary-400)" }}
                    >
                      {item.shortDescription}
                    </p>

                    <Link
                      href={`/news/${item.id}`}
                      className="inline-flex items-center font-medium text-sm transition-colors hover:opacity-80"
                      style={{ color: "var(--color-primary-500)" }}
                    >
                      Читать далее
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center">
                <div className="flex gap-2">
                  {currentPage > 1 && (
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="btn-discord btn-discord-secondary text-sm"
                    >
                      Назад
                    </button>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 2
                      );
                    })
                    .map((page, index, array) => {
                      const showEllipsis = index > 0 && array[index - 1] !== page - 1;
                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsis && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                              currentPage === page
                                ? "btn-discord btn-discord-primary"
                                : "btn-discord btn-discord-secondary"
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}

                  {currentPage < totalPages && (
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="btn-discord btn-discord-secondary text-sm"
                    >
                      Далее
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}