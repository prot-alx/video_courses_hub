import {
  formatDuration,
  formatCourseDuration,
  parseDuration,
} from "../lib/utils/duration";

describe("Duration utilities", () => {
  describe("formatDuration", () => {
    describe("full format", () => {
      it("should format hours, minutes and seconds", () => {
        expect(formatDuration(3665, "full")).toBe("1ч 1м 5с");
      });

      it("should format only hours and minutes", () => {
        expect(formatDuration(3660, "full")).toBe("1ч 1м");
      });

      it("should format only hours", () => {
        expect(formatDuration(3600, "full")).toBe("1ч");
      });

      it("should format only minutes and seconds", () => {
        expect(formatDuration(65, "full")).toBe("1м 5с");
      });

      it("should format only minutes", () => {
        expect(formatDuration(60, "full")).toBe("1м");
      });

      it("should format only seconds", () => {
        expect(formatDuration(45, "full")).toBe("45с");
      });
    });

    describe("short format", () => {
      it("should format hours and minutes without seconds", () => {
        expect(formatDuration(3665, "short")).toBe("1ч 1м");
      });

      it("should format only hours", () => {
        expect(formatDuration(3600, "short")).toBe("1ч");
      });

      it("should format only minutes", () => {
        expect(formatDuration(65, "short")).toBe("1м");
      });

      it("should format seconds when no minutes", () => {
        expect(formatDuration(45, "short")).toBe("45с");
      });
    });

    describe("compact format", () => {
      it("should format with colons for hours", () => {
        expect(formatDuration(3665, "compact")).toBe("1:01:05");
      });

      it("should format with colons for minutes only", () => {
        expect(formatDuration(65, "compact")).toBe("1:05");
      });

      it("should pad with zeros", () => {
        expect(formatDuration(3605, "compact")).toBe("1:00:05");
      });
    });

    describe("edge cases", () => {
      it("should handle null input", () => {
        expect(formatDuration(null)).toBe("N/A");
      });

      it("should handle undefined input", () => {
        expect(formatDuration(undefined)).toBe("N/A");
      });

      it("should handle zero", () => {
        expect(formatDuration(0)).toBe("N/A");
      });

      it("should handle negative numbers", () => {
        expect(formatDuration(-60)).toBe("N/A");
      });
    });
  });

  describe("parseDuration", () => {
    it("should parse MM:SS format", () => {
      expect(parseDuration("01:30")).toBe(90);
      expect(parseDuration("10:05")).toBe(605);
    });

    it("should parse HH:MM:SS format", () => {
      expect(parseDuration("1:30:45")).toBe(5445);
      expect(parseDuration("0:05:30")).toBe(330);
    });

    it("should handle edge cases", () => {
      expect(parseDuration("")).toBe(null);
      expect(parseDuration("   ")).toBe(null);
      expect(parseDuration("invalid")).toBe(null);
      expect(parseDuration("1:2:3:4")).toBe(null);
      expect(parseDuration("aa:bb")).toBe(null);
    });

    it("should handle single digits", () => {
      expect(parseDuration("1:5")).toBe(65);
      expect(parseDuration("0:1:5")).toBe(65);
    });
  });

  describe("formatCourseDuration", () => {
    it("should sum up video durations and format", () => {
      const videos = [
        { duration: 3600 }, // 1 час
        { duration: 1800 }, // 30 минут
        { duration: null }, // пропускаем
        { duration: 300 }, // 5 минут
      ];

      expect(formatCourseDuration(videos, "short")).toBe("1ч 35м");
    });

    it("should handle empty array", () => {
      expect(formatCourseDuration([], "short")).toBe("N/A");
    });

    it("should handle all null durations", () => {
      const videos = [{ duration: null }, { duration: null }];

      expect(formatCourseDuration(videos, "short")).toBe("N/A");
    });

    it("should work with different formats", () => {
      const videos = [{ duration: 3665 }];

      expect(formatCourseDuration(videos, "full")).toBe("1ч 1м 5с");
      expect(formatCourseDuration(videos, "short")).toBe("1ч 1м");
      expect(formatCourseDuration(videos, "compact")).toBe("1:01:05");
    });
  });
});
