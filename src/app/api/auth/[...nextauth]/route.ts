import { handlers } from "@/lib/auth";
import { rateLimit, rateLimitConfigs } from "@/lib/rateLimit";
import { NextRequest } from "next/server";

const authRateLimit = rateLimit(rateLimitConfigs.auth);
const sessionRateLimit = rateLimit(rateLimitConfigs.session);

async function GET(request: NextRequest) {
  // Проверяем если это session endpoint - используем более мягкий лимит
  const url = new URL(request.url);
  const isSessionEndpoint = url.pathname.includes("/session");

  const rateLimitResponse = await (isSessionEndpoint
    ? sessionRateLimit
    : authRateLimit)(request);
  if (rateLimitResponse) return rateLimitResponse;

  return handlers.GET(request);
}

async function POST(request: NextRequest) {
  // POST запросы обычно для логина/signup - используем строгий лимит
  const rateLimitResponse = await authRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  return handlers.POST(request);
}

export { GET, POST };
