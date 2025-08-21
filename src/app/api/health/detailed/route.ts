// Detailed health check endpoint (требует авторизации админа)
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface DetailedHealthCheck {
  status: "healthy" | "unhealthy";
  timestamp: string;
  server: {
    uptime: number;
    nodeVersion: string;
    platform: string;
    memory: {
      used: string;
      total: string;
      percentage: number;
    };
  };
  database: {
    status: "healthy" | "unhealthy";
    responseTime?: number;
    stats?: {
      totalUsers: number;
      totalCourses: number;
      totalVideos: number;
      activeCourses: number;
      pendingRequests: number;
    };
    error?: string;
  };
  storage: {
    status: "healthy" | "unhealthy";
    paths: {
      uploads: boolean;
      videos: boolean;
      thumbnails: boolean;
    };
    sizes?: {
      videosCount: number;
      thumbnailsCount: number;
      totalVideoSize: string;
    };
    error?: string;
  };
}

export async function GET() {
  try {
    const session = await auth();

    // Только админы могут видеть детальную информацию
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const healthCheck: DetailedHealthCheck = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      server: {
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          used: "",
          total: "",
          percentage: 0,
        },
      },
      database: {
        status: "healthy",
      },
      storage: {
        status: "healthy",
        paths: {
          uploads: false,
          videos: false,
          thumbnails: false,
        },
      },
    };

    // Server info
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.rss + memUsage.heapUsed + memUsage.external;
    healthCheck.server.memory = {
      used: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(totalMem / 1024 / 1024)}MB`,
      percentage: Math.round((memUsage.heapUsed / totalMem) * 100),
    };

    // Database detailed check
    try {
      const dbStart = Date.now();

      const [
        totalUsers,
        totalCourses,
        totalVideos,
        activeCourses,
        pendingRequests,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.video.count(),
        prisma.course.count({ where: { isActive: true } }),
        prisma.courseRequest.count({ where: { status: "new" } }),
      ]);

      const dbTime = Date.now() - dbStart;

      healthCheck.database = {
        status: "healthy",
        responseTime: dbTime,
        stats: {
          totalUsers,
          totalCourses,
          totalVideos,
          activeCourses,
          pendingRequests,
        },
      };
    } catch (error) {
      healthCheck.status = "unhealthy";
      healthCheck.database = {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Database check failed",
      };
    }

    // Storage detailed check
    try {
      const fs = await import("fs");
      const path = await import("path");

      const uploadsPath = path.join(process.cwd(), "uploads");
      const videosPath = path.join(uploadsPath, "videos");
      const thumbnailsPath = path.join(uploadsPath, "thumbnails");

      const uploadsExists = fs.existsSync(uploadsPath);
      const videosExists = fs.existsSync(videosPath);
      const thumbnailsExists = fs.existsSync(thumbnailsPath);

      healthCheck.storage.paths = {
        uploads: uploadsExists,
        videos: videosExists,
        thumbnails: thumbnailsExists,
      };

      if (videosExists && thumbnailsExists) {
        const videoFiles = fs.readdirSync(videosPath);
        const thumbnailFiles = fs.readdirSync(thumbnailsPath);

        // Подсчитываем общий размер видеофайлов
        let totalVideoSize = 0;
        videoFiles.forEach((file: string) => {
          try {
            const stats = fs.statSync(path.join(videosPath, file));
            totalVideoSize += stats.size;
          } catch {
            // Игнорируем файлы, которые нельзя прочитать
          }
        });

        healthCheck.storage.sizes = {
          videosCount: videoFiles.length,
          thumbnailsCount: thumbnailFiles.length,
          totalVideoSize: `${Math.round(totalVideoSize / 1024 / 1024)}MB`,
        };
      }

      if (!uploadsExists || !videosExists || !thumbnailsExists) {
        healthCheck.status = "unhealthy";
        healthCheck.storage.status = "unhealthy";
        healthCheck.storage.error = "Some storage directories are missing";
      }
    } catch (error) {
      healthCheck.status = "unhealthy";
      healthCheck.storage = {
        status: "unhealthy",
        paths: { uploads: false, videos: false, thumbnails: false },
        error: error instanceof Error ? error.message : "Storage check failed",
      };
    }

    const statusCode = healthCheck.status === "healthy" ? 200 : 503;

    return NextResponse.json(healthCheck, {
      status: statusCode,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Health check failed",
      },
      { status: 500 }
    );
  }
}
