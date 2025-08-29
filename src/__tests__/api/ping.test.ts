import { GET, HEAD } from "../../app/api/ping/route";

// Мокаем NextResponse
jest.mock("next/server", () => {
  const MockNextResponse = jest.fn().mockImplementation((body, init) => ({
    status: init?.status || 200,
    headers: {
      get: (name: string) => {
        const headers = init?.headers || {};
        return headers[name as keyof typeof headers];
      },
    },
    text: () => Promise.resolve(body || ""),
  }));

  (MockNextResponse as any).json = jest.fn();

  return {
    NextResponse: MockNextResponse,
  };
});

import { NextResponse } from "next/server";
const mockNextResponseJson = (NextResponse as any).json;

// Теперь NextResponse работает и как конструктор

describe("/api/ping", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Мокаем process.uptime()
    jest.spyOn(process, "uptime").mockReturnValue(12345);
    // Мокаем Date для предсказуемого результата
    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2023-01-01T00:00:00.000Z");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("GET method", () => {
    it("should return ping response with correct data", async () => {
      const mockJsonResponse = { json: "response" };
      mockNextResponseJson.mockReturnValue(mockJsonResponse);

      const response = await GET();

      expect(mockNextResponseJson).toHaveBeenCalledWith(
        {
          status: "ok",
          timestamp: "2023-01-01T00:00:00.000Z",
          uptime: 12345,
        },
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

      expect(response).toBe(mockJsonResponse);
    });

    it("should have no-cache headers", async () => {
      mockNextResponseJson.mockReturnValue({});

      await GET();

      const [, options] = mockNextResponseJson.mock.calls[0];
      expect(options.headers).toEqual({
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      });
    });

    it("should return current uptime", async () => {
      const mockUptime = 99999;
      jest.spyOn(process, "uptime").mockReturnValue(mockUptime);
      mockNextResponseJson.mockReturnValue({});

      await GET();

      const [data] = mockNextResponseJson.mock.calls[0];
      expect(data.uptime).toBe(mockUptime);
    });

    it("should return ISO timestamp", async () => {
      const mockTimestamp = "2025-12-31T23:59:59.999Z";
      jest.spyOn(Date.prototype, "toISOString").mockReturnValue(mockTimestamp);
      mockNextResponseJson.mockReturnValue({});

      await GET();

      const [data] = mockNextResponseJson.mock.calls[0];
      expect(data.timestamp).toBe(mockTimestamp);
    });
  });

  describe("HEAD method", () => {
    it("should return response with 200 status and no-cache headers", async () => {
      const response = await HEAD();

      expect(response.status).toBe(200);
      expect(response.headers.get("Cache-Control")).toBe(
        "no-cache, no-store, must-revalidate"
      );
    });

    it("should return empty body", async () => {
      const response = await HEAD();

      const body = await response.text();
      expect(body).toBe("");
    });

    it("should have correct headers", async () => {
      const response = await HEAD();

      expect(response.headers.get("Cache-Control")).toBe(
        "no-cache, no-store, must-revalidate"
      );
    });
  });

  describe("Response consistency", () => {
    it('should always return status "ok"', async () => {
      mockNextResponseJson.mockReturnValue({});

      await GET();

      const [data] = mockNextResponseJson.mock.calls[0];
      expect(data.status).toBe("ok");
    });

    it("should return different timestamps on multiple calls", async () => {
      mockNextResponseJson.mockReturnValue({});

      // Первый вызов
      jest
        .spyOn(Date.prototype, "toISOString")
        .mockReturnValueOnce("2023-01-01T00:00:00.000Z");
      await GET();

      // Второй вызов с другим временем
      jest
        .spyOn(Date.prototype, "toISOString")
        .mockReturnValueOnce("2023-01-01T00:01:00.000Z");
      await GET();

      expect(mockNextResponseJson).toHaveBeenCalledTimes(2);

      const firstCall = mockNextResponseJson.mock.calls[0][0];
      const secondCall = mockNextResponseJson.mock.calls[1][0];

      expect(firstCall.timestamp).toBe("2023-01-01T00:00:00.000Z");
      expect(secondCall.timestamp).toBe("2023-01-01T00:01:00.000Z");
    });
  });
});
