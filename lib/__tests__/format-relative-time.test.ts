import { describe, it, expect, vi, afterEach } from "vitest";
import { formatRelativeTime } from "../utils";

describe("formatRelativeTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for very recent dates", () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe("just now");
  });

  it("returns minutes ago for < 60 minutes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:05:00Z"));
    const fiveMinAgo = new Date("2025-06-15T12:00:00Z");
    expect(formatRelativeTime(fiveMinAgo)).toBe("5m ago");
    vi.useRealTimers();
  });

  it("returns hours ago for < 24 hours", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T15:00:00Z"));
    const threeHoursAgo = new Date("2025-06-15T12:00:00Z");
    expect(formatRelativeTime(threeHoursAgo)).toBe("3h ago");
    vi.useRealTimers();
  });

  it("returns days ago for < 7 days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
    const twoDaysAgo = new Date("2025-06-13T12:00:00Z");
    expect(formatRelativeTime(twoDaysAgo)).toBe("2d ago");
    vi.useRealTimers();
  });

  it("returns formatted date for >= 7 days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
    const tenDaysAgo = new Date("2025-06-05T12:00:00Z");
    const result = formatRelativeTime(tenDaysAgo);
    // Should be a locale-formatted date string, not a relative time
    expect(result).not.toContain("ago");
    expect(result).not.toContain("in ");
    vi.useRealTimers();
  });

  // Future date tests (post Branch D merge)
  it("returns 'soon' for dates < 1 minute in the future", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
    const soonDate = new Date("2025-06-15T12:00:30Z");
    expect(formatRelativeTime(soonDate)).toBe("soon");
    vi.useRealTimers();
  });

  it("returns 'in Xm' for future dates < 1 hour away", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
    const fiveMinFuture = new Date("2025-06-15T12:05:00Z");
    expect(formatRelativeTime(fiveMinFuture)).toBe("in 5m");
    vi.useRealTimers();
  });

  it("returns 'in Xh' for future dates < 1 day away", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
    const threeHoursFuture = new Date("2025-06-15T15:00:00Z");
    expect(formatRelativeTime(threeHoursFuture)).toBe("in 3h");
    vi.useRealTimers();
  });

  it("returns 'in Xd' for future dates >= 1 day away", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
    const twoDaysFuture = new Date("2025-06-17T12:00:00Z");
    expect(formatRelativeTime(twoDaysFuture)).toBe("in 2d");
    vi.useRealTimers();
  });
});
