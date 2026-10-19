import { describe, expect, it, vi } from "vitest";
import { analyzePhoto } from "../../supabase/functions/analyze-site-photo/analyze";
import { parseFindings, simulatedFindings, validatePhoto } from "../../supabase/functions/analyze-site-photo/contract";

const photo = { image: "AAAAAAAAAAAAAAAA", mimeType: "image/jpeg" };
const url = (model: string) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
const okResponse = (findings: unknown[]) => new Response(JSON.stringify({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(findings) }] } }] }));

describe("direct Google camera analysis", () => {
  it("uses simulated findings without making a request when GEMINI_API_KEY is missing", async () => {
    const fetcher = vi.fn();
    const result = await analyzePhoto(photo, undefined, fetcher);
    expect(result.source).toBe("simulated");
    expect(result.findings).toEqual(simulatedFindings);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("sends the photo to Google directly, not through workspace AI", async () => {
    const fetcher = vi.fn().mockResolvedValue(okResponse([simulatedFindings[1]]));
    const result = await analyzePhoto(photo, "test-only-not-a-credential", fetcher);
    expect(fetcher.mock.calls[0][0]).toBe(url("gemini-1.5-flash"));
    const body = JSON.parse(fetcher.mock.calls[0][1].body);
    expect(body.contents[0].parts[1].inlineData).toEqual({ data: photo.image, mimeType: "image/jpeg" });
    expect(JSON.stringify(body)).not.toContain("test-only-not-a-credential");
    expect(fetcher.mock.calls[0][1].headers["x-goog-api-key"]).toBe("test-only-not-a-credential");
    expect(result.source).toBe("gemini");
    expect(result.findings[0].label).toBe("Solar DC & EV Electrical Isolation (LOTO)");
    expect(result.findings[0].riskDelta).toBe(0);
  });
  it("moves to the next model when a retired model name is rejected", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response("gone", { status: 404 }))
      .mockResolvedValueOnce(new Response("gone", { status: 404 }))
      .mockResolvedValueOnce(okResponse([simulatedFindings[1]]));
    const result = await analyzePhoto(photo, "test-only", fetcher);
    expect(fetcher.mock.calls.map(call => call[0])).toEqual([url("gemini-1.5-flash"), url("gemini-2.0-flash"), url("gemini-3-flash-preview")]);
    expect(result.source).toBe("gemini");
    expect(result.message).toContain("gemini-3-flash-preview");
  });
  it("waits and retries once when Google reports overload", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response("busy", { status: 503 })).mockResolvedValueOnce(okResponse([simulatedFindings[1]]));
    const result = await analyzePhoto(photo, "test-only", fetcher, 30_000, 0);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[1][0]).toBe(url("gemini-1.5-flash"));
    expect(result.source).toBe("gemini");
  });
  it("falls back to simulated findings when every model stays busy", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("busy", { status: 503 }));
    const result = await analyzePhoto(photo, "test-only", fetcher, 30_000, 0);
    expect(fetcher).toHaveBeenCalledTimes(6);
    expect(result.source).toBe("simulated");
    expect(result.message).toContain("HTTP 503");
  });
  it("renders decimal confidence values as whole-number percentages", () => {
    const percent = (confidence: number) => parseFindings([{ ...simulatedFindings[0], confidence }])[0].confidence;
    expect(percent(0.93)).toBe(93);
    expect(percent(0.89)).toBe(89);
    expect(percent(1)).toBe(100);
    expect(percent(0)).toBe(0);
    expect(percent(96)).toBe(96);
    expect(percent(92.6)).toBe(93);
  });
  it("normalizes decimal Google confidence before returning findings", async () => {
    const finding = { ...simulatedFindings[1], confidence: 0.89 };
    const fetcher = vi.fn().mockResolvedValue(okResponse([finding]));
    const result = await analyzePhoto(photo, "test-only", fetcher);
    expect(result.source).toBe("gemini");
    expect(result.findings[0].confidence).toBe(89);
  });
  it("stops at once when the Google key is rejected", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("denied", { status: 403 }));
    const result = await analyzePhoto(photo, "test-only", fetcher);
    expect(result.source).toBe("simulated");
    expect(result.message).toContain("Google key or access needs attention");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("falls back when Google times out", async () => {
    const fetcher = vi.fn((_url, options) => new Promise<Response>((_resolve, reject) => {
      options?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
    }));
    expect((await analyzePhoto(photo, "test-only", fetcher, 5)).source).toBe("simulated");
  });
  it("falls back on invalid or refused responses", async () => {
    for (const body of [{ promptFeedback: { blockReason: "SAFETY" } }, { candidates: [{ content: { parts: [{ text: "not json" }] } }] }]) {
      const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(body)));
      expect((await analyzePhoto(photo, "test-only", fetcher)).source).toBe("simulated");
    }
  });
  it("rejects invalid findings and invalid photo inputs", () => {
    expect(() => parseFindings([{ ...simulatedFindings[0], confidence: 101 }])).toThrow();
    expect(validatePhoto(photo)).toEqual(photo);
    expect(validatePhoto({ ...photo, mimeType: "text/html" })).toBeNull();
    expect(validatePhoto({ ...photo, image: "bad payload" })).toBeNull();
  });
});
