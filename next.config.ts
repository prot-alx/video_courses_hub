import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Оптимизация изображений
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 дней
  },

  // Сжатие
  compress: true,

  // Кэширование заголовков
  async headers() {
    return [
      {
        source: '/uploads/thumbnails/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, immutable', // 30 дней
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 год
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, immutable', // 30 дней
          },
        ],
      },
    ];
  },

  // Экспериментальные функции для производительности
  experimental: {
    optimizePackageImports: ['zustand', 'lucide-react'],
  },
};

export default nextConfig;
