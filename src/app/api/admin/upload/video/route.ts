import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { execSync } from "child_process";
import { rateLimit, rateLimitConfigs } from "@/lib/rateLimit";
import { validateVideoFile } from "@/lib/fileValidation";

const uploadRateLimit = rateLimit(rateLimitConfigs.upload);

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const rateLimitResponse = await uploadRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("video") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Видеофайл не предоставлен" },
        { status: 400 }
      );
    }

    // Комплексная валидация файла (тип, размер, сигнатура)
    const validationResult = await validateVideoFile(file);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error || "Недопустимый видеофайл",
        },
        { status: 400 }
      );
    }

    // Создаем уникальное имя файла
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}-${originalName}`;

    // Создаем папку для видео если не существует
    const uploadsDir = join(process.cwd(), "uploads");
    const videosDir = join(uploadsDir, "videos");

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    if (!existsSync(videosDir)) {
      await mkdir(videosDir, { recursive: true });
    }

    // Сохраняем файл
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(videosDir, fileName);

    await writeFile(filePath, buffer);

    // Возвращаем информацию о загруженном файле
    return NextResponse.json({
      success: true,
      data: {
        filename: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Ошибка загрузки видео:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}

// Получить информацию о свободном месте
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    let diskInfo = {
      total: "N/A",
      used: "N/A", 
      available: "N/A",
      usePercentage: "N/A",
    };

    try {
      const isWindows = process.platform === "win32";
      
      if (isWindows) {
        // Для Windows используем wmic команду
        const driveLetter = process.cwd().charAt(0);
        const output = execSync(
          `wmic logicaldisk where caption="${driveLetter}:" get size,freespace,caption /format:csv`,
          { encoding: "utf8" }
        );
        
        const lines = output.trim().split("\n").filter(line => line.includes(driveLetter));
        if (lines.length > 0) {
          const data = lines[0].split(",");
          const freeSpace = parseInt(data[2]);
          const totalSpace = parseInt(data[3]);
          const usedSpace = totalSpace - freeSpace;
          const usePercentage = Math.round((usedSpace / totalSpace) * 100);

          const formatBytes = (bytes: number) => {
            if (bytes === 0) return "0 B";
            const k = 1024;
            const sizes = ["B", "KB", "MB", "GB", "TB"];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
          };

          diskInfo = {
            total: formatBytes(totalSpace),
            used: formatBytes(usedSpace),
            available: formatBytes(freeSpace),
            usePercentage: `${usePercentage}%`,
          };
        }
      } else {
        // Для Linux/Mac используем df команду
        const output = execSync("df -h .", { encoding: "utf8" });
        const lines = output.trim().split("\n");
        if (lines.length > 1) {
          const data = lines[1].split(/\s+/);
          diskInfo = {
            total: data[1],
            used: data[2],
            available: data[3],
            usePercentage: data[4],
          };
        }
      }

      return NextResponse.json({
        success: true,
        data: diskInfo,
      });
    } catch (diskError) {
      console.error("Ошибка получения информации о диске:", diskError);
      return NextResponse.json({
        success: true,
        data: diskInfo,
      });
    }
  } catch (error) {
    console.error("Ошибка получения информации о диске:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
