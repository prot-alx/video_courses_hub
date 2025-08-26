"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  onError?: () => void;
  fallback?: React.ReactNode;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className = "",
  priority = false,
  sizes,
  onError,
  fallback,
}: Readonly<OptimizedImageProps>) {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Сброс ошибки при изменении src
  useEffect(() => {
    setImageError(false);
    setIsLoaded(false);
  }, [src]);

  const handleError = () => {
    setImageError(true);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Если есть ошибка, показываем fallback
  if (imageError) {
    if (fill) {
      return (
        <div className={`absolute inset-0 flex items-center justify-center bg-gray-200 ${className}`}>
          {fallback || (
            <span className="text-gray-400 text-sm">Изображение недоступно</span>
          )}
        </div>
      );
    }
    
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={{ width, height }}
      >
        {fallback || (
          <span className="text-gray-400 text-sm">Изображение недоступно</span>
        )}
      </div>
    );
  }

  // Генерируем blur placeholder
  const blurDataURL =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGBkaGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bsnjyiuWz7s6l3T7hGlJzQJMqFWJ/9k=";

  if (fill) {
    return (
      <div className={`absolute inset-0 ${className}`}>
        {/* Loading placeholder для fill режима */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        <Image
          src={src}
          alt={alt}
          fill
          className={`transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading={priority ? "eager" : "lazy"}
          quality={85}
          placeholder="blur"
          blurDataURL={blurDataURL}
          sizes={
            sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          }
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder для обычного режима */}
      {!isLoaded && (
        <div className="bg-gray-200 animate-pulse" style={{ width, height }} />
      )}

      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        loading={priority ? "eager" : "lazy"}
        quality={85}
        placeholder="blur"
        blurDataURL={blurDataURL}
        sizes={
          sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        }
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
