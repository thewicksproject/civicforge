import { describe, expect, it } from "vitest";
import { parseJsonBody } from "@/lib/http/json";

describe("parseJsonBody", () => {
  it("returns an error for malformed JSON", async () => {
    const request = new Request("http://localhost/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{invalid",
    });

    const parsed = await parseJsonBody(request);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error).toBe("Invalid JSON body");
    }
  });

  it("returns an error when JSON is not an object", async () => {
    const request = new Request("http://localhost/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: '"hello"',
    });

    const parsed = await parseJsonBody(request);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error).toBe("Request body must be a JSON object");
    }
  });

  it("returns parsed object for valid JSON", async () => {
    const request = new Request("http://localhost/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "ok" }),
    });

    const parsed = await parseJsonBody<{ text: string }>(request);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data.text).toBe("ok");
    }
  });
});
