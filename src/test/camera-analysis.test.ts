import { describe, expect, it, vi } from "vitest";
import { analyzePhoto } from "../../supabase/functions/analyze-site-photo/analyze";
import { parseFindings, simulatedFindings, validatePhoto } from "../../supabase/functions/analyze-site-photo/contract";

const photo = { image: "AAAAAAAAAAAAAAAA", mimeType: "image/jpeg" };

describe("direct Google camera analysis", () => {
  it("uses simulated findings without making a request when GEMINI_API_KEY is missing", async () => {
    const fetcher = vi.fn();
    const result = await analyzePhoto(photo, undefined, fetcher);
    expect(result.source).toBe("simulated");
    expect(result.findings).toEqual(simulatedFindings);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("calls Google directly and returns structured photo findings, not workspace AI", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify([simulatedFindings[1]]) }] } }] })));
    const result = await analyzePhoto(photo, "test-only-not-a-credential", fetcher);
    expect(fetcher.mock.calls[0][0]).toBe("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent");
    const body = JSON.parse(fetcher.mock.calls[0][1].body);
    expect(body.contents[0].parts[1].inlineData).toEqual({ data: photo.image, mimeType: "image/jpeg" });
    expect(result.source).toBe("gemini");
    expect(result.findings[0].label).toBe("Solar DC & EV Electrical Isolation (LOTO)");
    expect(result.findings[0].riskDelta).toBe(0);
  });
  it("falls back on Google errors without retrying", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("provider error", { status: 403 }));
    expect((await analyzePhoto(photo, "test-only", fetcher)).source).toBe("simulated");
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