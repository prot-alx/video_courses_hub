// Временная заглушка для Next.js 15.x типизации
// Этот файл можно удалить после исправления бага Next.js

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "This endpoint is not implemented",
    },
    { status: 404 }
  );
}
