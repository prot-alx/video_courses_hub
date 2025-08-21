// Health check endpoint
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface HealthCheck {
  status: "healthy" | "unhealthy";
  timestamp: string;
  checks: {
    database: {
      status: "healthy" | "unhealthy";
      responseTime?: number;
      error?: string;
    };
    diskSpace: {
      status: "healthy" | "unhealthy";
      available?: string;
      error?: string;
    };
    uploads: {
      status: "healthy" | "unhealthy";
      videosDir?: boolean;
      thumbnailsDir?: boolean;
      error?: string;
    };
  };
  uptime: number;
  version?: string;
}

export async function GET() {
  const healthCheck: HealthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: "healthy" },
      diskSpace: { status: "healthy" },
      uploads: { status: "healthy" },
    },
    uptime: process.uptime(),
  };

  // 1. Database Health Check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbTime = Date.now() - dbStart;

    healthCheck.checks.database = {
      status: "healthy",
      responseTime: dbTime,
    };
  } catch (error) {
    healthCheck.status = "unhealthy";
    healthCheck.checks.database = {
      status: "unhealthy",
      error:
        error instanceof Error ? error.message : "Database connection failed",
    };
  }

  // 2. Disk Space Check
  try {
    // На Windows используем другой подход
    if (process.platform === "win32") {
      healthCheck.checks.diskSpace = {
        status: "healthy",
        available: "Available (Windows)",
      };
    } else {
      // Для Unix-систем
      const { execSync } = await import("child_process");
      try {
        const output = execSync("df -h .", { encoding: "utf8" });
        const lines = output.trim().split("\n");
        const data = lines[1].split(/\s+/);
        const available = data[3];

        healthCheck.checks.diskSpace = {
          status: "healthy",
          available,
        };
      } catch (diskError) {
        console.log(diskError);
        healthCheck.checks.diskSpace = {
          status: "healthy",
          available: "Unknown",
        };
      }
    }
  } catch (error) {
    healthCheck.checks.diskSpace = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Disk space check failed",
    };
  }

  // 3. Uploads Directory Check
  try {
    const fs = await import("fs");
    const path = await import("path");

    const uploadsPath = path.join(process.cwd(), "uploads");
    const videosPath = path.join(uploadsPath, "videos");
    const thumbnailsPath = path.join(uploadsPath, "thumbnails");

    const videosExists = fs.existsSync(videosPath);
    const thumbnailsExists = fs.existsSync(thumbnailsPath);

    healthCheck.checks.uploads = {
      status: videosExists && thumbnailsExists ? "healthy" : "unhealthy",
      videosDir: videosExists,
      thumbnailsDir: thumbnailsExists,
    };

    if (!videosExists || !thumbnailsExists) {
      healthCheck.status = "unhealthy";
      healthCheck.checks.uploads.error = "Upload directories missing";
    }
  } catch (error) {
    healthCheck.status = "unhealthy";
    healthCheck.checks.uploads = {
      status: "unhealthy",
      error:
        error instanceof Error
          ? error.message
          : "Upload directory check failed",
    };
  }

  // Добавляем версию из package.json если доступна
  try {
    const packageJson = await import("../../../../package.json");
    healthCheck.version = packageJson.default?.version || packageJson.version;
  } catch {
    // Игнорируем если package.json недоступен
  }

  const statusCode = healthCheck.status === "healthy" ? 200 : 503;

  return NextResponse.json(healthCheck, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
